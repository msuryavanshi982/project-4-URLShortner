const isEmpty = function (url) {
  if (typeof url === "undefined" || url === null) return false;
  if (typeof url === "string" && url.trim().length === 0) return false;
  return true;
};

const isValidId = function (id) {
  return mongoose.Types.ObjectId.isValid(id);
};

module.exports = {isEmpty, isValidId}