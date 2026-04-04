export const createService = async ({ model, data } = {}) => {
  return await model.create(data);
};

export const findService = async ({ model, filter = {}, select = "" } = {}) => {
  return await model.find(filter).select(select);
};

export const findOneService = async ({
  model,
  filter = {},
  select = "",
} = {}) => {
  return await model.findOne(filter).select(select);
};

export const findByIdService = async ({ model, id, select = "" } = {}) => {
  return await model.findById(id).select(select);
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

export const updateOneService = async ({
  model,
  filter = {},
  update = {},
} = {}) => {
  return await model.updateOne(filter, update, { runValidators: true });
};

export const deleteOneService = async ({ model, filter = {} } = {}) => {
  return await model.deleteOne(filter);
};

export const deleteManyService = async ({ model, filter = {} } = {}) => {
  return await model.deleteMany(filter);
};
