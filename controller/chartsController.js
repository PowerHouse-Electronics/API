const { ChartJSNodeCanvas } = require('chartjs-node-canvas');
const Order = require('../models/orderModel');
const fs = require('fs');

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
                    backgroundColor: 'rgba(54, 162, 235, 0.6)',
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

const generateProductsData = (products) => {
    const productCounts = {};
    products.forEach((item) => {
        const { product, quantity } = item;
        const { name } = product;

        if (name in productCounts) {
            productCounts[name] += quantity;
        } else {
            productCounts[name] = quantity;
        }
    });

    const sortedProducts = Object.entries(productCounts).sort((a, b) => b[1] - a[1]);
    const topProducts = sortedProducts.slice(0, 5); // Mostrar los 5 productos más vendidos (puedes ajustar esto)

    const labels = topProducts.map(([productName, quantity]) => productName);
    const values = topProducts.map(([productName, quantity]) => quantity);

    return { labels, values };
};

const generateChartAndSend = async (req, res) => {
    try {
        const { orderId } = req.params;
        const order = await Order.findById(orderId).populate('products.product');

        if (!order) {
            return res.status(404).json({ error: 'La orden no existe' });
        }

        const productsData = generateProductsData(order.products);
        if (!productsData) {
            return res.status(400).json({ error: 'No se pudo obtener los datos de los productos' });
        }

        const outputPath = `src/charts/${orderId}.png`;
        await generateChart(productsData, outputPath);

        // Envía la gráfica como respuesta o guarda la ruta en la orden para futuras referencias, según tu necesidad
        res.status(200).json({ message: 'Gráfica generada correctamente', chartPath: outputPath });
    } catch (error) {
        res.status(500).json({ error: 'Error al generar la gráfica' });
    }
};

module.exports = {
    generateChartAndSend,
};
