const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const { currentFiscalYear } = require('../src/utils/fiscalYear');

const prisma = new PrismaClient();

// Every seeded user shares this password so the printed credentials stay short.
const SEED_PASSWORD = 'Password@123';
const fiscalYear = currentFiscalYear();

async function hash(password) {
  return bcrypt.hash(password, 10);
}

async function main() {
  const passwordHash = await hash(SEED_PASSWORD);

  // --- Users: admin, officers, farmers, buyers ---------------------------
  const admin = await prisma.user.create({
    data: {
      name: 'System Admin',
      phone: '9800000001',
      email: 'admin@agrilink.test',
      passwordHash,
      role: 'admin',
    },
  });

  const officerChitwanUser = await prisma.user.create({
    data: {
      name: 'Shyam Thapa',
      phone: '9800000002',
      email: 'officer.chitwan@agrilink.test',
      passwordHash,
      role: 'officer',
    },
  });
  const officerChitwan = await prisma.officer.create({
    data: { userId: officerChitwanUser.id, office: 'Agriculture Knowledge Center, Chitwan', district: 'Chitwan' },
  });

  const officerJhapaUser = await prisma.user.create({
    data: {
      name: 'Gita Rai',
      phone: '9800000003',
      email: 'officer.jhapa@agrilink.test',
      passwordHash,
      role: 'officer',
    },
  });
  const officerJhapa = await prisma.officer.create({
    data: { userId: officerJhapaUser.id, office: 'Agriculture Knowledge Center, Jhapa', district: 'Jhapa' },
  });

  const farmerUsersData = [
    { name: 'Ram Bahadur Karki', phone: '9800000011', email: 'ram.karki@agrilink.test' },
    { name: 'Sita Kumari Adhikari', phone: '9800000012', email: 'sita.adhikari@agrilink.test' },
    { name: 'Hari Prasad Sharma', phone: '9800000013', email: 'hari.sharma@agrilink.test' },
    { name: 'Laxmi Devi Mahato', phone: '9800000014', email: 'laxmi.mahato@agrilink.test' },
  ];
  const farmerUsers = [];
  for (const data of farmerUsersData) {
    farmerUsers.push(await prisma.user.create({ data: { ...data, passwordHash, role: 'farmer' } }));
  }

  const farmer1 = await prisma.farmer.create({
    data: {
      userId: farmerUsers[0].id,
      citizenshipNo: '12-34-56-00001',
      landRegNo: 'CTW-LR-1001',
      landArea: 12.5,
      district: 'Chitwan',
      documentUrls: [],
      verificationStatus: 'verified',
      verifiedById: officerChitwan.id,
      remarks: 'Documents verified in person.',
    },
  });
  const farmer2 = await prisma.farmer.create({
    data: {
      userId: farmerUsers[1].id,
      citizenshipNo: '12-34-56-00002',
      landRegNo: 'CTW-LR-1002',
      landArea: 6.25,
      district: 'Chitwan',
      documentUrls: [],
      verificationStatus: 'pending',
    },
  });
  const farmer3 = await prisma.farmer.create({
    data: {
      userId: farmerUsers[2].id,
      citizenshipNo: '23-45-67-00003',
      landRegNo: 'JHP-LR-2001',
      landArea: 20,
      district: 'Jhapa',
      documentUrls: [],
      verificationStatus: 'verified',
      verifiedById: officerJhapa.id,
      remarks: 'Land registration confirmed.',
    },
  });
  const farmer4 = await prisma.farmer.create({
    data: {
      userId: farmerUsers[3].id,
      citizenshipNo: '23-45-67-00004',
      landRegNo: 'JHP-LR-2002',
      landArea: 8,
      district: 'Jhapa',
      documentUrls: [],
      verificationStatus: 'pending',
    },
  });

  const buyerUsersData = [
    { name: 'Anil Shrestha', phone: '9800000021', email: 'anil.shrestha@agrilink.test' },
    { name: 'Sunita Gurung', phone: '9800000022', email: 'sunita.gurung@agrilink.test' },
    { name: 'Bikash Lama', phone: '9800000023', email: 'bikash.lama@agrilink.test' },
  ];
  const buyers = [];
  for (const data of buyerUsersData) {
    buyers.push(await prisma.user.create({ data: { ...data, passwordHash, role: 'buyer' } }));
  }
  const [buyer1, buyer2, buyer3] = buyers;

  // --- Crops ---------------------------------------------------------------
  const cropDefs = [
    { name: 'Paddy', nameNe: 'धान', category: 'Cereal' },
    { name: 'Wheat', nameNe: 'गहुँ', category: 'Cereal' },
    { name: 'Maize', nameNe: 'मकै', category: 'Cereal' },
    { name: 'Sugarcane', nameNe: 'उख', category: 'Cash Crop' },
    { name: 'Potato', nameNe: 'आलु', category: 'Vegetable' },
    { name: 'Tomato', nameNe: 'गोलभेडा', category: 'Vegetable' },
    { name: 'Cauliflower', nameNe: 'काउली', category: 'Vegetable' },
    { name: 'Mustard', nameNe: 'तोरी', category: 'Oilseed' },
    { name: 'Lentil', nameNe: 'मुसुरो', category: 'Pulse' },
    { name: 'Cabbage', nameNe: 'बन्दा', category: 'Vegetable' },
  ];
  const crops = {};
  for (const def of cropDefs) {
    crops[def.name] = await prisma.crop.create({ data: def });
  }

  // --- MSP rates for paddy / wheat / sugarcane ------------------------------
  const mspDefs = [
    { crop: 'Paddy', rates: { A: 33.0, B: 31.0, C: 29.0 } },
    { crop: 'Wheat', rates: { A: 34.0, B: 32.0, C: 30.0 } },
    { crop: 'Sugarcane', rates: { A: 6.0, B: 5.5, C: 5.0 } },
  ];
  const settingOfficer = officerChitwan; // MSP is set nationally; any officer account can represent the author.
  for (const { crop, rates } of mspDefs) {
    for (const [grade, ratePerKg] of Object.entries(rates)) {
      await prisma.mspRate.create({
        data: {
          cropId: crops[crop].id,
          grade,
          ratePerKg,
          fiscalYear,
          setById: settingOfficer.id,
        },
      });
    }
  }

  // --- Products (~20), spread across the 4 farmers --------------------------
  const daysAgo = (n) => new Date(Date.now() - n * 24 * 60 * 60 * 1000);

  const productDefs = [
    // farmer1 (Chitwan, verified)
    { farmer: farmer1, crop: 'Paddy', quantityKg: 500, grade: 'A', pricePerKg: 35, harvest: 3 },
    { farmer: farmer1, crop: 'Paddy', quantityKg: 300, grade: 'B', pricePerKg: 28, harvest: 5, belowMsp: true },
    { farmer: farmer1, crop: 'Tomato', quantityKg: 150, grade: 'A', pricePerKg: 60, harvest: 1 },
    { farmer: farmer1, crop: 'Lentil', quantityKg: 100, grade: 'A', pricePerKg: 180, harvest: 10 },
    { farmer: farmer1, crop: 'Mustard', quantityKg: 80, grade: 'B', pricePerKg: 150, harvest: 12 },
    // farmer2 (Chitwan, pending)
    { farmer: farmer2, crop: 'Maize', quantityKg: 400, grade: 'A', pricePerKg: 40, harvest: 4 },
    { farmer: farmer2, crop: 'Potato', quantityKg: 600, grade: 'B', pricePerKg: 45, harvest: 2 },
    { farmer: farmer2, crop: 'Cauliflower', quantityKg: 120, grade: 'A', pricePerKg: 55, harvest: 1 },
    { farmer: farmer2, crop: 'Cabbage', quantityKg: 200, grade: 'B', pricePerKg: 38, harvest: 6 },
    { farmer: farmer2, crop: 'Wheat', quantityKg: 350, grade: 'C', pricePerKg: 29, harvest: 8, belowMsp: true },
    // farmer3 (Jhapa, verified)
    { farmer: farmer3, crop: 'Wheat', quantityKg: 700, grade: 'A', pricePerKg: 36, harvest: 7 },
    { farmer: farmer3, crop: 'Sugarcane', quantityKg: 1000, grade: 'A', pricePerKg: 6.5, harvest: 15 },
    { farmer: farmer3, crop: 'Maize', quantityKg: 250, grade: 'B', pricePerKg: 38, harvest: 3 },
    { farmer: farmer3, crop: 'Tomato', quantityKg: 90, grade: 'B', pricePerKg: 52, harvest: 2 },
    { farmer: farmer3, crop: 'Lentil', quantityKg: 60, grade: 'A', pricePerKg: 190, harvest: 20 },
    // farmer4 (Jhapa, pending)
    { farmer: farmer4, crop: 'Sugarcane', quantityKg: 800, grade: 'B', pricePerKg: 5.2, harvest: 9, belowMsp: true },
    { farmer: farmer4, crop: 'Potato', quantityKg: 450, grade: 'A', pricePerKg: 48, harvest: 4 },
    { farmer: farmer4, crop: 'Cauliflower', quantityKg: 100, grade: 'B', pricePerKg: 50, harvest: 3 },
    { farmer: farmer4, crop: 'Cabbage', quantityKg: 180, grade: 'A', pricePerKg: 42, harvest: 5 },
    { farmer: farmer4, crop: 'Mustard', quantityKg: 70, grade: 'C', pricePerKg: 130, harvest: 14 },
  ];

  const products = [];
  for (const def of productDefs) {
    products.push(
      await prisma.product.create({
        data: {
          farmerId: def.farmer.id,
          cropId: crops[def.crop].id,
          quantityKg: def.quantityKg,
          grade: def.grade,
          pricePerKg: def.pricePerKg,
          harvestDate: daysAgo(def.harvest),
          description: `${def.crop} - grade ${def.grade}, freshly harvested.`,
          imageUrls: [],
          belowMsp: Boolean(def.belowMsp),
        },
      }),
    );
  }

  // --- Orders, payments and a review ---------------------------------------
  // Order 1: delivered, paid, reviewed - buyer1 bought farmer1's paddy.
  const paddyProduct = products[0];
  const order1 = await prisma.order.create({
    data: {
      buyerId: buyer1.id,
      totalAmount: Number(paddyProduct.pricePerKg) * 50,
      status: 'delivered',
      deliveryAddress: 'Bharatpur-10, Chitwan',
      items: {
        create: [{ productId: paddyProduct.id, quantityKg: 50, unitPrice: paddyProduct.pricePerKg }],
      },
    },
  });
  await prisma.payment.create({
    data: { orderId: order1.id, gateway: 'mock', txnRef: 'MOCK-TXN-0001', amount: order1.totalAmount, status: 'completed' },
  });
  await prisma.review.create({
    data: { orderId: order1.id, farmerId: farmer1.id, buyerId: buyer1.id, rating: 5, comment: 'Great quality paddy, delivered on time.' },
  });

  // Order 2: confirmed, paid, no review yet - buyer2 bought farmer3's wheat (products[10]).
  const wheatProduct = products[10];
  const order2 = await prisma.order.create({
    data: {
      buyerId: buyer2.id,
      totalAmount: Number(wheatProduct.pricePerKg) * 100,
      status: 'confirmed',
      deliveryAddress: 'Damak-5, Jhapa',
      items: {
        create: [{ productId: wheatProduct.id, quantityKg: 100, unitPrice: wheatProduct.pricePerKg }],
      },
    },
  });
  await prisma.payment.create({
    data: { orderId: order2.id, gateway: 'mock', txnRef: 'MOCK-TXN-0002', amount: order2.totalAmount, status: 'completed' },
  });

  // Order 3: pending payment - buyer3 checking out farmer1's tomato.
  const tomatoProduct = products[2];
  const order3 = await prisma.order.create({
    data: {
      buyerId: buyer3.id,
      totalAmount: Number(tomatoProduct.pricePerKg) * 20,
      status: 'pending_payment',
      deliveryAddress: 'Pokhara-8, Kaski',
      items: {
        create: [{ productId: tomatoProduct.id, quantityKg: 20, unitPrice: tomatoProduct.pricePerKg }],
      },
    },
  });
  await prisma.payment.create({
    data: { orderId: order3.id, gateway: 'mock', txnRef: null, amount: order3.totalAmount, status: 'initiated' },
  });

  // --- Bids ------------------------------------------------------------------
  const in72h = () => new Date(Date.now() + 72 * 60 * 60 * 1000);
  const maizeProduct = products[12]; // farmer3's Maize, grade B
  await prisma.bid.create({
    data: {
      productId: maizeProduct.id,
      buyerId: buyer2.id,
      quantityKg: 80,
      offeredPrice: Number(maizeProduct.pricePerKg) - 2,
      status: 'pending',
      expiresAt: in72h(),
    },
  });
  const lentilProduct = products[3];
  await prisma.bid.create({
    data: {
      productId: lentilProduct.id,
      buyerId: buyer1.id,
      quantityKg: 40,
      offeredPrice: Number(lentilProduct.pricePerKg) - 5,
      status: 'accepted',
      expiresAt: in72h(),
    },
  });
  const potatoProduct = products[6]; // farmer2's Potato, grade B
  await prisma.bid.create({
    data: {
      productId: potatoProduct.id,
      buyerId: buyer3.id,
      quantityKg: 100,
      offeredPrice: Number(potatoProduct.pricePerKg) - 3,
      status: 'rejected',
      expiresAt: in72h(),
    },
  });

  // --- Subsidy schemes ---------------------------------------------------
  await prisma.subsidyScheme.create({
    data: {
      title: 'Chemical Fertilizer Subsidy',
      description: 'Partial reimbursement for certified chemical fertilizer purchases.',
      type: 'fertilizer',
      maxAmount: 15000,
      deadline: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
      isActive: true,
    },
  });
  await prisma.subsidyScheme.create({
    data: {
      title: 'Drip Irrigation Equipment Subsidy',
      description: 'Support for installing drip irrigation systems on registered farmland.',
      type: 'irrigation',
      maxAmount: 50000,
      deadline: new Date(Date.now() + 120 * 24 * 60 * 60 * 1000),
      isActive: true,
    },
  });

  console.log('\nSeed complete. Fiscal year used for MSP rates:', fiscalYear);
  console.log('\n--- Seed login credentials (all use the same password) ---');
  console.log(`Password for every account below: ${SEED_PASSWORD}\n`);
  console.log('Role     Name                    Phone        District');
  console.log('-------  ----------------------  -----------  --------');
  console.log(`admin    ${admin.name.padEnd(22)}  ${admin.phone}  -`);
  console.log(`officer  ${officerChitwanUser.name.padEnd(22)}  ${officerChitwanUser.phone}  Chitwan`);
  console.log(`officer  ${officerJhapaUser.name.padEnd(22)}  ${officerJhapaUser.phone}  Jhapa`);
  farmerUsers.forEach((u, i) => {
    const district = [farmer1, farmer2, farmer3, farmer4][i].district;
    const status = [farmer1, farmer2, farmer3, farmer4][i].verificationStatus;
    console.log(`farmer   ${u.name.padEnd(22)}  ${u.phone}  ${district} (${status})`);
  });
  buyers.forEach((u) => {
    console.log(`buyer    ${u.name.padEnd(22)}  ${u.phone}  -`);
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
