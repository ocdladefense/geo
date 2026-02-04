import path from "path";
import { fileURLToPath } from 'url';
import HtmlWebpackPlugin from "html-webpack-plugin";
import CopyPlugin from "copy-webpack-plugin";
import Dotenv from 'dotenv-webpack';


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);




export default env => {
    console.log(env);

    return {
        entry: {
            app: path.resolve(__dirname, "./src/js/index.js"),
            map: path.resolve(__dirname, "./src/js/map.js")
        },
        optimization: {
            splitChunks: {
                chunks: 'all',
            },
        },
        cache: {
            type: 'filesystem',
            buildDependencies: {
                config: [__filename], // Invalidate cache when webpack.config.js changes
            },
        },
        snapshot: {
            buildDependencies: { timestamp: true, hash: true },
            managedPaths: ["/node_modules"],
            unmanagedPaths: ["/dev_modules"]
        },
        watchOptions: {
            followSymlinks: true
        },
        resolve: {
            symlinks: false,
            extensions: [".js", ".jsx"]
        },
        output: {
            path: path.resolve(__dirname, "dist"),
            publicPath: "/",
            filename: "[name].bundle.js",
            assetModuleFilename: "images/[name][ext]",
            clean: true
        },
        target: "web",
        devServer: {
            static: path.resolve(__dirname, "./src"),
            port: 8080,
            open: true,
            hot: true,
            compress: true,
            historyApiFallback: true
        },
        devtool: "source-map",
        module: {
            rules: [
                {
                    test: /\.(js|jsx)$/,
                    include: [
                        path.resolve(__dirname, 'node_modules/@ocdla'),
                        path.resolve(__dirname, 'src/components'),
                        path.resolve(__dirname, 'src/js')
                    ],
                    use: {
                        loader: "babel-loader",
                        options: {
                            presets: [
                                ["@babel/preset-env", { modules: false }],
                                [
                                    "@babel/preset-react",
                                    {
                                        throwIfNamespace: false, // defaults to true
                                        runtime: "automatic", // defaults to classic
                                        targets: {
                                            chrome: "120"
                                        }
                                        // "importSource": "custom-jsx-library" // defaults to react (only in automatic runtime)
                                    }
                                ]
                            ]
                        }
                    }
                },
                {
                    test: /\.ts$/,
                    use: "ts-loader"
                },
                {
                    test: /\.css$/i,
                    use: ["style-loader", "css-loader", "postcss-loader"]
                },
                {
                    test: /\.(svg|eot|ttf|woff|woff2|webp|png|jpg|gif)$/i,
                    type: "asset/resource"
                },
                {
                    test: /\.xml$/i,
                    type: "asset/source"
                },
                {
                    test: /\.html$/i,
                    exclude: [path.resolve(__dirname, "src/pages/index.html"), path.resolve(__dirname, "src/pages/map.html")],
                    loader: "asset/source"
                }
            ]
        },
        plugins: [
            new Dotenv(),
            new HtmlWebpackPlugin({
                template: path.resolve(__dirname, "./src/pages/index.html"),
                chunks: ["app"],
                inject: "body",
                filename: "index.html"
            }),
            new HtmlWebpackPlugin({
                template: path.resolve(__dirname, "./src/pages/map.html"),
                chunks: ["map"],
                inject: "body",
                filename: "map.html"
            }),
            new CopyPlugin({
                patterns: [
                    {
                        from: path.resolve(__dirname, "src/images"),
                        to: path.resolve(__dirname, "dist/images")
                    },
                    {
                        from: path.resolve(__dirname, "src/data"),
                        to: path.resolve(__dirname, "dist/data")
                    },
                    "src/.nojekyll",
                    "src/manifest.json",
                    "src/sw.js",
                    "src/robots.txt",
                    "src/.htaccess"
                ]
            })
        ]
    };
};
