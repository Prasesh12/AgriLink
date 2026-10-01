const prisma = require('../config/prisma');

async function notify({ userId, type, message }) {
  return prisma.notification.create({ data: { userId, type, message } });
}

module.exports = { notify };
