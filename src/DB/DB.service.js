export const createService = async ({ model, data } = {}) => {
  return await model.create(data);
};

export const findOneService = async ({ model, filter = {}, select = "" } = {}) => {
  return await model.findOne(filter).select(select);
};

export const findOneAndUpdateService = async ({
  model,
  filter = {},
  update = {},
  options = {},
} = {}) => {
  const doc = model.findOneAndUpdate(filter, update, {
    new: true,
    runValidators: true,
    ...options,
  });
  return await doc.exec();
};

