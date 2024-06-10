export default {
  morganLogger:
    ':date[web] :method :url :status :res[content-length] - :response-time ms',
    port: process.env.PORT,
}
