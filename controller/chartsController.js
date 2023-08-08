const { ChartJSNodeCanvas } = require('chartjs-node-canvas');
const Order = require('../models/orderModel');
const fs = require('fs');
const CellPhone = require('../models/celularModel');
const Computer = require('../models/computerModel');
const GConsole = require('../models/gConsoleModel');
const { parseISO, format } = require('date-fns');


const width = 800;
const height = 400;

const chartCallback = (ChartJS) => {
    ChartJS.register({
        id: 'custom_canvas_background_color',
        beforeDraw: (chart) => {
            const ctx = chart.canvas.getContext('2d');
            ctx.save();
            ctx.globalCompositeOperation = 'destination-over';
            ctx.fillStyle = 'white';
            ctx.fillRect(0, 0, chart.width, chart.height);
            ctx.restore();
        },
    });
};

const generateChart = async (data, outputPath) => {
    const configuration = {
        type: 'bar',
        data: {
            labels: data.labels,
            datasets: [
                {
                    label: 'Cantidad vendida',
                    data: data.values,
                    backgroundColor: data.values.map(() => {
                        const r = Math.floor(Math.random() * 255);
                        const g = Math.floor(Math.random() * 255);
                        const b = Math.floor(Math.random() * 255);
                        return `rgba(${r}, ${g}, ${b}, 0.8)`;
                    }),
                    borderColor: 'rgba(54, 162, 235, 1)',
                    borderWidth: 1,
                },
            ],
        },
        options: {
            scales: {
                y: {
                    beginAtZero: true,
                },
            },
            plugins: {
                legend: {
                    display: false,
                },
            },
        },
        plugins: [chartCallback],
    };

    const canvasRenderService = new ChartJSNodeCanvas({ width, height });
    const image = await canvasRenderService.renderToBuffer(configuration);
    fs.writeFileSync(outputPath, image);
};

const generateProductsData = async (orders) => {
    try {
        const products = [];
        for (const order of orders) {
            for (const product of order.products) {
                const productId = product.product.toString();
                let existingProduct;

                try {
                    existingProduct = await CellPhone.findById(productId);
                    if (!existingProduct) {
                        existingProduct = await Computer.findById(productId);
                        if (!existingProduct) {
                            existingProduct = await GConsole.findById(productId);
                            if (!existingProduct) {
                                return false;
                            }
                        }
                    }
                } catch (error) {
                    console.log(error);
                    return false;
                }

                const existingProductIndex = products.findIndex((p) => p.product === productId);
                if (existingProductIndex !== -1) {
                    products[existingProductIndex].quantity += product.quantity;
                } else {
                    products.push({ product: productId, quantity: product.quantity });
                }
            }
        }

        products.sort((a, b) => b.quantity - a.quantity);
        const topProducts = products.slice(0, 5);

        const labels = [];
        const values = [];

        for (const product of topProducts) {
            try {
                existingProduct = await CellPhone.findById(product.product);
                if (!existingProduct) {
                    existingProduct = await Computer.findById(product.product);
                    if (!existingProduct) {
                        existingProduct = await GConsole.findById(product.product);
                        if (!existingProduct) {
                            return false;
                        }
                    }
                }
            } catch (error) {
                console.log(error);
                return false;
            }

            labels.push(existingProduct.model);
            values.push(product.quantity);
        }
        return { labels, values };
    } catch (error) {
        console.log(error);
        return false;
    }
};



const generateWeeklyRevenueData = async (orders) => {
    const weeklyRevenue = {};

    for (const order of orders) {
        const orderDate = new Date(order.createdAt);
        const weekNumber = format(orderDate, 'd');

        const totalRevenue = order.products.reduce((total, product) => {
            return total + product.price * product.quantity;
        }, 0);

        if (weeklyRevenue[weekNumber]) {
            weeklyRevenue[weekNumber] += totalRevenue;
        } else {
            weeklyRevenue[weekNumber] = totalRevenue;
        }
    }

    const labels = Object.keys(weeklyRevenue).sort((a, b) => a - b);
    const values = labels.map((weekNumber) => weeklyRevenue[weekNumber]);
    labels.forEach((label, index) => {
        labels[index] = `Dia ${label}`;
    });


    return { labels, values };
};




const generateChartAndSend = async (req, res) => {
    try {
        const orders = await Order.find(); 
        const productsData = await generateProductsData(orders);

        if (!productsData) {
            return res.status(400).json({ error: 'No se pudieron obtener los datos de los productos' });
        }

        const revenueData = await generateWeeklyRevenueData(orders);

        if (!revenueData) {
            return res.status(400).json({ error: 'No se pudieron obtener los datos de las ganancias' });
        }

        const outputPath = `src/charts/chart.png`;
        await generateChart(productsData, outputPath);

        const imageBaseUrl = req.protocol + '://' + req.get('host');
        const imageUrl = imageBaseUrl + '/chart.png';
        const revenueOutputPath = `src/charts/revenue_chart.png`;
        await generateChart(revenueData, revenueOutputPath);

        const revenueImageUrl = imageBaseUrl + '/revenue_chart.png';

        return res.status(200).json({
            message: 'Gráficas',
            TopPRoducts: imageUrl,
            Daylyprofit: revenueImageUrl,
        });

    } catch (error) {
        console.log(error);
        return res.status(500).json({ error: 'Error al generar la gráfica' });
    }
};



module.exports = {
    generateChartAndSend
};
