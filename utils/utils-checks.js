const isEqualObjects = (...objects) => objects.every(obj => JSON.stringify(obj) === JSON.stringify(objects[0]));

module.exports = { isEqualObjects };

