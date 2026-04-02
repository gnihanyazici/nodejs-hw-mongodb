export const errorHandler = (err, req, res) => {

  res.status(err.status || 500).json({
    status: err.status || 500,
    message: "Something went wrong",
    data: err.message, // Hatayı Postman'de de görelim
  });
};