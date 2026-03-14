export const validation = (schema) => {
  return (req, res, next) => {
    let errResults = [];

    for (const key of Object.keys(schema)) {
      const { error } = schema[key].validate(req[key], { abortEarly: false });
      if (error) {
        error.details.forEach((element) => {
          errResults.push({
            key,
            path: element.path[0],
            message: element.message,
          });
        });
      }
    }

    if (errResults.length > 0) {
      return res
        .status(400)
        .json({ message: "Validation error", details: errResults });
    }

    next();
  };
};
