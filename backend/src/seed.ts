import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Model, Types } from 'mongoose';
import { Dish } from './modules/dishes/schemas/dish.schema';
import { DailyMenu } from './modules/daily-menu/schemas/daily-menu.schema';
import { User } from './modules/users/schemas/user.schema';
import { Order } from './modules/orders/schemas/order.schema';
import { Conversation } from './modules/chat/schemas/conversation.schema';
import { Message } from './modules/chat/schemas/message.schema';
import { Branch } from './modules/branches/schemas/branch.schema';
import * as bcrypt from 'bcrypt';

async function seedDatabase() {
  const app = await NestFactory.createApplicationContext(AppModule);
  
  const dishModel = app.get<Model<Dish>>('DishModel');
  const dailyMenuModel = app.get<Model<DailyMenu>>('DailyMenuModel');
  const userModel = app.get<Model<User>>('UserModel');
  const orderModel = app.get<Model<Order>>('OrderModel');
  const conversationModel = app.get<Model<Conversation>>('ConversationModel');
  const messageModel = app.get<Model<Message>>('MessageModel');
  const branchModel = app.get<Model<Branch>>('BranchModel');
  
  // Clear existing data
  await dishModel.deleteMany({});
  await dailyMenuModel.deleteMany({});
  await userModel.deleteMany({});
  await orderModel.deleteMany({});
  await conversationModel.deleteMany({});
  await messageModel.deleteMany({});
  await branchModel.deleteMany({});

  // ==================== SEED USERS ====================
  const hashedPassword = await bcrypt.hash('admin123', 10);
  const userPassword = await bcrypt.hash('123456', 10);

  const admin = await userModel.create({
    username: 'admin',
    fullName: 'Admin User',
    email: 'admin@fastmeal.com',
    password: hashedPassword,
    role: 'admin',
  });
  console.log('👤 Created admin account (admin@fastmeal.com / admin123)');

  const staff1 = await userModel.create({
    username: 'nhanvien1',
    fullName: 'Trần Văn Bình',
    email: 'binh.tran@fastmeal.com',
    password: userPassword,
    role: 'staff',
  });

  const staff2 = await userModel.create({
    username: 'nhanvien2',
    fullName: 'Lê Thị Hương',
    email: 'huong.le@fastmeal.com',
    password: userPassword,
    role: 'staff',
  });
  console.log('👷 Created 2 staff accounts (password: 123456)');

  const customers = await userModel.insertMany([
    { username: 'nguyenvana', fullName: 'Nguyễn Văn An', email: 'an.nguyen@gmail.com', password: userPassword, role: 'customer' },
    { username: 'phamthib', fullName: 'Phạm Thị Bích', email: 'bich.pham@gmail.com', password: userPassword, role: 'customer' },
    { username: 'hoangvanc', fullName: 'Hoàng Văn Cường', email: 'cuong.hoang@gmail.com', password: userPassword, role: 'customer' },
    { username: 'tranthid', fullName: 'Trần Thị Dung', email: 'dung.tran@gmail.com', password: userPassword, role: 'customer' },
    { username: 'levane', fullName: 'Lê Văn Em', email: 'em.le@gmail.com', password: userPassword, role: 'customer' },
    { username: 'vuthif', fullName: 'Vũ Thị Fương', email: 'fuong.vu@gmail.com', password: userPassword, role: 'customer' },
  ]);
  console.log(`👥 Created ${customers.length} customer accounts (password: 123456)`);
  
  // Seed dishes with Vietnamese names and categories
  const dishes = [
    // ==================== WINGS ====================
    {
      name: 'Cánh gà BBQ',
      description: 'Cánh gà nướng sốt BBQ thơm lừng, giòn bên ngoài, mềm bên trong',
      price: 59000,
      imageUrl: 'https://images.unsplash.com/photo-1608039755401-742074f0548d?w=600&q=80',
      category: 'Wings',
      isAvailable: true,
    },
    {
      name: 'Cánh gà cay',
      description: 'Cánh gà chiên giòn tẩm sốt cay buffalo đặc biệt',
      price: 59000,
      imageUrl: 'https://images.unsplash.com/photo-1567620832903-9fc6debc209f?w=600&q=80',
      category: 'Wings',
      isAvailable: true,
    },
    {
      name: 'Cánh gà tỏi',
      description: 'Cánh gà chiên giòn với sốt bơ tỏi thơm ngậy',
      price: 59000,
      imageUrl: 'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=600&q=80',
      category: 'Wings',
      isAvailable: true,
    },
    {
      name: 'Cánh gà mật ong',
      description: 'Cánh gà tẩm mật ong nướng vàng, vị ngọt tự nhiên',
      price: 65000,
      imageUrl: 'https://images.unsplash.com/photo-1527477396000-e27163b481c2?w=600&q=80',
      category: 'Wings',
      isAvailable: true,
    },
    {
      name: 'Cánh gà sốt Teriyaki',
      description: 'Cánh gà chiên giòn phủ sốt Teriyaki Nhật Bản, rắc mè rang',
      price: 65000,
      imageUrl: 'https://images.unsplash.com/photo-1614398751058-56b65e092a37?w=600&q=80',
      category: 'Wings',
      isAvailable: true,
    },

    // ==================== CƠM ====================
    {
      name: 'Cơm gà chiên mắm',
      description: 'Cơm trắng dẻo kèm đùi gà chiên mắm giòn rụm, ăn kèm dưa leo',
      price: 45000,
      imageUrl: 'https://images.unsplash.com/photo-1569058242567-93de6f36f8eb?w=600&q=80',
      category: 'Cơm',
      isAvailable: true,
    },
    {
      name: 'Cơm sườn nướng',
      description: 'Cơm tấm sườn nướng than hoa, bì, chả, trứng ốp la',
      price: 50000,
      imageUrl: 'https://images.unsplash.com/photo-1512058564366-18510be2db19?w=600&q=80',
      category: 'Cơm',
      isAvailable: true,
    },
    {
      name: 'Cơm chiên dương châu',
      description: 'Cơm chiên với tôm, lạp xưởng, trứng, đậu Hà Lan, cà rốt',
      price: 42000,
      imageUrl: 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=600&q=80',
      category: 'Cơm',
      isAvailable: true,
    },
    {
      name: 'Cơm bò lúc lắc',
      description: 'Cơm trắng với bò Úc xào lúc lắc tiêu đen, kèm rau trộn',
      price: 65000,
      imageUrl: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&q=80',
      category: 'Cơm',
      isAvailable: true,
    },
    {
      name: 'Cơm gà teriyaki',
      description: 'Cơm Nhật với gà áp chảo sốt teriyaki, rau củ hấp và trứng cuộn',
      price: 55000,
      imageUrl: 'https://images.unsplash.com/photo-1567337710282-00832b415979?w=600&q=80',
      category: 'Cơm',
      isAvailable: true,
    },

    // ==================== MÌ / PHỞ ====================
    {
      name: 'Phở bò tái chín',
      description: 'Phở bò truyền thống với nước dùng ninh xương 12 giờ, bò tái lăn',
      price: 45000,
      imageUrl: 'https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?w=600&q=80',
      category: 'Mì & Phở',
      isAvailable: true,
    },
    {
      name: 'Bún bò Huế',
      description: 'Bún bò cay nồng đặc trưng xứ Huế, giò heo, chả cua, huyết',
      price: 50000,
      imageUrl: 'https://images.unsplash.com/photo-1576577445504-6af96477db52?w=600&q=80',
      category: 'Mì & Phở',
      isAvailable: true,
    },
    {
      name: 'Mì xào hải sản',
      description: 'Mì trứng xào với tôm, mực, nghêu và rau củ tươi',
      price: 55000,
      imageUrl: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=600&q=80',
      category: 'Mì & Phở',
      isAvailable: true,
    },
    {
      name: 'Hủ tiếu Nam Vang',
      description: 'Hủ tiếu nước trong với tôm, thịt băm, gan, tim và giá đỗ',
      price: 45000,
      imageUrl: 'https://images.unsplash.com/photo-1555126634-323283e090fa?w=600&q=80',
      category: 'Mì & Phở',
      isAvailable: true,
    },

    // ==================== SANDWICHES / BÁNH MÌ ====================
    {
      name: 'Bánh mì gà giòn',
      description: 'Gà chiên giòn kẹp với rau sống, dưa leo và sốt mayo',
      price: 35000,
      imageUrl: 'https://images.unsplash.com/photo-1553909489-cd47e0907980?w=600&q=80',
      category: 'Bánh mì',
      isAvailable: true,
    },
    {
      name: 'Bánh mì gà cay',
      description: 'Gà chiên tẩm sốt cay đặc biệt kèm rau sống tươi',
      price: 38000,
      imageUrl: 'https://images.unsplash.com/photo-1606755962773-d324e0a13086?w=600&q=80',
      category: 'Bánh mì',
      isAvailable: true,
    },
    {
      name: 'Bánh mì thịt nướng',
      description: 'Bánh mì Việt Nam với thịt nướng, đồ chua, rau mùi, ớt',
      price: 30000,
      imageUrl: 'https://images.unsplash.com/photo-1600688640154-9619e002df30?w=600&q=80',
      category: 'Bánh mì',
      isAvailable: true,
    },
    {
      name: 'Burger bò phô mai',
      description: 'Burger bò Úc 150g với phô mai cheddar, rau xà lách, cà chua, sốt đặc biệt',
      price: 69000,
      imageUrl: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&q=80',
      category: 'Bánh mì',
      isAvailable: true,
    },

    // ==================== FRIES / ĐỒ CHIÊN ====================
    {
      name: 'Khoai tây chiên',
      description: 'Khoai tây chiên giòn vàng với gia vị đặc biệt',
      price: 25000,
      imageUrl: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=600&q=80',
      category: 'Đồ chiên',
      isAvailable: true,
    },
    {
      name: 'Khoai tây phô mai',
      description: 'Khoai tây chiên phủ phô mai, thịt xông khói và sốt ranch',
      price: 39000,
      imageUrl: 'https://images.unsplash.com/photo-1585109649139-366815a0d713?w=600&q=80',
      category: 'Đồ chiên',
      isAvailable: true,
    },
    {
      name: 'Gà popcorn',
      description: 'Miếng gà nhỏ chiên giòn tẩm bột gia vị, chấm sốt mayo cay',
      price: 35000,
      imageUrl: 'https://images.unsplash.com/photo-1562967914-608f82629710?w=600&q=80',
      category: 'Đồ chiên',
      isAvailable: true,
    },
    {
      name: 'Onion rings',
      description: 'Hành tây tẩm bột chiên giòn vàng ươm, chấm sốt BBQ',
      price: 29000,
      imageUrl: 'https://images.unsplash.com/photo-1639024471283-03518883512d?w=600&q=80',
      category: 'Đồ chiên',
      isAvailable: true,
    },
    {
      name: 'Chả giò rế',
      description: 'Chả giò truyền thống giòn rụm, nhân tôm thịt, chấm nước mắm chua ngọt',
      price: 32000,
      imageUrl: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=600&q=80',
      category: 'Đồ chiên',
      isAvailable: true,
    },

    // ==================== SALAD / RAU ====================
    {
      name: 'Salad Caesar gà nướng',
      description: 'Xà lách romaine, gà nướng, phô mai parmesan, bánh mì nướng, sốt Caesar',
      price: 45000,
      imageUrl: 'https://images.unsplash.com/photo-1546793665-c74683f339c1?w=600&q=80',
      category: 'Salad',
      isAvailable: true,
    },
    {
      name: 'Gỏi cuốn tôm thịt',
      description: 'Gỏi cuốn bánh tráng với tôm, thịt luộc, bún, rau sống, chấm tương đen',
      price: 35000,
      imageUrl: 'https://images.unsplash.com/photo-1562967916-eb82221dfb44?w=600&q=80',
      category: 'Salad',
      isAvailable: true,
    },
    {
      name: 'Salad trộn bò',
      description: 'Rau xà lách trộn với bò tái chanh, hành tây, rau thơm và nước mắm chua ngọt',
      price: 50000,
      imageUrl: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=600&q=80',
      category: 'Salad',
      isAvailable: true,
    },

    // ==================== DRINKS ====================
    {
      name: 'Trà đào cam sả',
      description: 'Trà xanh pha cùng đào miếng, cam tươi và sả thơm, đá lạnh',
      price: 29000,
      imageUrl: 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=600&q=80',
      category: 'Đồ uống',
      isAvailable: true,
    },
    {
      name: 'Coca-Cola',
      description: 'Coca-Cola lon 330ml lạnh mát',
      price: 15000,
      imageUrl: 'https://images.unsplash.com/photo-1554866585-cd94860890b7?w=600&q=80',
      category: 'Đồ uống',
      isAvailable: true,
    },
    {
      name: 'Sinh tố bơ',
      description: 'Sinh tố bơ béo ngậy xay cùng sữa đặc và đá viên',
      price: 32000,
      imageUrl: 'https://images.unsplash.com/photo-1638176066666-ffb2f013c7dd?w=600&q=80',
      category: 'Đồ uống',
      isAvailable: true,
    },
    {
      name: 'Nước ép cam',
      description: 'Nước cam tươi nguyên chất ép tại chỗ, giàu vitamin C',
      price: 25000,
      imageUrl: 'https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?w=600&q=80',
      category: 'Đồ uống',
      isAvailable: true,
    },
    {
      name: 'Trà sữa trân châu',
      description: 'Trà sữa đậm đà cùng trân châu đường đen dẻo mềm',
      price: 35000,
      imageUrl: 'https://images.unsplash.com/photo-1558857563-b371033873b8?w=600&q=80',
      category: 'Đồ uống',
      isAvailable: true,
    },

    // ==================== DESSERTS ====================
    {
      name: 'Chè thái',
      description: 'Chè thái với nước cốt dừa, mít, thạch, đậu phộng và đá bào',
      price: 25000,
      imageUrl: 'https://images.unsplash.com/photo-1551024506-0bccd828d307?w=600&q=80',
      category: 'Tráng miệng',
      isAvailable: true,
    },
    {
      name: 'Bánh flan caramel',
      description: 'Bánh flan mềm mịn với lớp caramel đắng nhẹ, béo ngậy',
      price: 20000,
      imageUrl: 'https://images.unsplash.com/photo-1624353365286-3f8d62daad51?w=600&q=80',
      category: 'Tráng miệng',
      isAvailable: true,
    },
    {
      name: 'Kem dừa non',
      description: 'Kem dừa non béo mát trong gáo dừa, topping đậu phộng và dừa nạo',
      price: 30000,
      imageUrl: 'https://images.unsplash.com/photo-1497034825429-c343d7c6a68f?w=600&q=80',
      category: 'Tráng miệng',
      isAvailable: true,
    },
  ];
  
  const insertedDishes = await dishModel.insertMany(dishes);
  console.log(`📦 Inserted ${insertedDishes.length} dishes`);

  // ==================== CREATE WEEKLY MENUS ====================
  // Each day gets a unique, themed set of 6-8 dishes
  const monday = new Date();
  const day = monday.getDay();
  const diff = monday.getDate() - day + (day === 0 ? -6 : 1);
  monday.setDate(diff);
  monday.setHours(0, 0, 0, 0);

  // Build a name→id map for easy reference
  const dishMap = new Map<string, typeof insertedDishes[0]>();
  insertedDishes.forEach(d => dishMap.set(d.name, d));

  const weeklyThemes = [
    {
      // Monday — "Khởi đầu tuần đầy năng lượng"
      dishes: [
        'Cơm sườn nướng', 'Phở bò tái chín', 'Cánh gà BBQ',
        'Bánh mì thịt nướng', 'Khoai tây chiên', 'Gỏi cuốn tôm thịt',
        'Trà đào cam sả', 'Bánh flan caramel',
      ],
    },
    {
      // Tuesday — "Hương vị Việt"
      dishes: [
        'Cơm gà chiên mắm', 'Bún bò Huế', 'Chả giò rế',
        'Bánh mì gà giòn', 'Gỏi cuốn tôm thịt', 'Salad trộn bò',
        'Sinh tố bơ', 'Chè thái',
      ],
    },
    {
      // Wednesday — "Fusion Wednesday"
      dishes: [
        'Cơm gà teriyaki', 'Cánh gà sốt Teriyaki', 'Burger bò phô mai',
        'Mì xào hải sản', 'Khoai tây phô mai', 'Salad Caesar gà nướng',
        'Trà sữa trân châu', 'Kem dừa non',
      ],
    },
    {
      // Thursday — "Bữa trưa đặc sắc"
      dishes: [
        'Cơm bò lúc lắc', 'Hủ tiếu Nam Vang', 'Cánh gà cay',
        'Bánh mì gà cay', 'Gà popcorn', 'Onion rings',
        'Nước ép cam', 'Bánh flan caramel',
      ],
    },
    {
      // Friday — "TGIF Party"
      dishes: [
        'Cánh gà BBQ', 'Cánh gà mật ong', 'Burger bò phô mai',
        'Khoai tây phô mai', 'Gà popcorn', 'Cơm chiên dương châu',
        'Coca-Cola', 'Kem dừa non',
      ],
    },
    {
      // Saturday — "Weekend Feast"
      dishes: [
        'Cơm sườn nướng', 'Phở bò tái chín', 'Cánh gà tỏi',
        'Mì xào hải sản', 'Chả giò rế', 'Salad Caesar gà nướng',
        'Trà đào cam sả', 'Chè thái',
      ],
    },
    {
      // Sunday — "Chủ nhật thảnh thơi"
      dishes: [
        'Cơm gà teriyaki', 'Bún bò Huế', 'Cánh gà mật ong',
        'Bánh mì thịt nướng', 'Khoai tây chiên', 'Gỏi cuốn tôm thịt',
        'Sinh tố bơ', 'Trà sữa trân châu', 'Bánh flan caramel',
      ],
    },
  ];

  const dayNames = ['Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7', 'Chủ nhật'];

  for (let i = 0; i < 7; i++) {
    const menuDate = new Date(monday);
    menuDate.setDate(menuDate.getDate() + i);
    menuDate.setHours(0, 0, 0, 0);

    const dayDishIds = weeklyThemes[i].dishes
      .map(name => dishMap.get(name)?._id)
      .filter(Boolean);

    await dailyMenuModel.findOneAndUpdate(
      { date: menuDate },
      { dishes: dayDishIds },
      { upsert: true, new: true },
    );

    console.log(`  📅 ${dayNames[i]}: ${dayDishIds.length} món`);
  }

  // ==================== SEED BRANCHES ====================
  await branchModel.insertMany([
    {
      name: 'FastMeal Quận 1',
      address: '123 Nguyễn Huệ',
      phone: '028 1234 5678',
      openingHours: '07:00 - 22:00',
      district: 'Quận 1',
      city: 'TP. Hồ Chí Minh',
      isActive: true,
    },
    {
      name: 'FastMeal Quận 3',
      address: '456 Võ Văn Tần',
      phone: '028 2345 6789',
      openingHours: '08:00 - 21:30',
      district: 'Quận 3',
      city: 'TP. Hồ Chí Minh',
      isActive: true,
    },
    {
      name: 'FastMeal Quận 7',
      address: '789 Nguyễn Hữu Thọ, Phú Mỹ Hưng',
      phone: '028 3456 7890',
      openingHours: '07:30 - 22:30',
      district: 'Quận 7',
      city: 'TP. Hồ Chí Minh',
      isActive: true,
    },
    {
      name: 'FastMeal Thủ Đức',
      address: '321 Võ Văn Ngân',
      phone: '028 4567 8901',
      openingHours: '08:00 - 22:00',
      district: 'TP. Thủ Đức',
      city: 'TP. Hồ Chí Minh',
      isActive: true,
    },
    {
      name: 'FastMeal Bình Thạnh',
      address: '55 Xô Viết Nghệ Tĩnh',
      phone: '028 5678 9012',
      openingHours: '07:00 - 21:00',
      district: 'Quận Bình Thạnh',
      city: 'TP. Hồ Chí Minh',
      isActive: false,
    },
  ]);
  console.log('🏪 Created 5 branches');

  // ==================== SEED ORDERS ====================
  const allDishes = insertedDishes;
  const statuses = ['pending', 'confirmed', 'preparing', 'delivering', 'completed', 'cancelled'];
  const addresses = [
    '12 Lý Tự Trọng, Quận 1, TP.HCM',
    '45 Trần Hưng Đạo, Quận 5, TP.HCM',
    '78 Nguyễn Thị Minh Khai, Quận 3, TP.HCM',
    '200 Điện Biên Phủ, Bình Thạnh, TP.HCM',
    '90 Lê Văn Sỹ, Quận 3, TP.HCM',
    '15 Phan Xích Long, Phú Nhuận, TP.HCM',
    '300 Nguyễn Văn Linh, Quận 7, TP.HCM',
    '88 Cách Mạng Tháng 8, Quận 10, TP.HCM',
  ];
  const phones = ['0901234567', '0912345678', '0923456789', '0934567890', '0945678901', '0956789012'];
  const notes = ['', 'Giao nhanh giúp em', 'Không hành', 'Ít cay', 'Để riêng nước chấm', 'Thêm ớt'];

  function randomItems(dishList: typeof allDishes, count: number) {
    const shuffled = [...dishList].sort(() => Math.random() - 0.5);
    const selected = shuffled.slice(0, count);
    return selected.map(d => ({
      dishId: d._id,
      name: d.name,
      price: d.price,
      quantity: Math.floor(Math.random() * 3) + 1,
      image: d.imageUrl,
    }));
  }

  let totalOrders = 0;
  for (let ci = 0; ci < customers.length; ci++) {
    const customer = customers[ci];
    const orderCount = 3 + Math.floor(Math.random() * 4); // 3-6 orders each

    for (let oi = 0; oi < orderCount; oi++) {
      const items = randomItems(allDishes, 2 + Math.floor(Math.random() * 3));
      const total = items.reduce((s, it) => s + it.price * it.quantity, 0);
      const daysAgo = Math.floor(Math.random() * 30);
      const orderDate = new Date();
      orderDate.setDate(orderDate.getDate() - daysAgo);
      orderDate.setHours(10 + Math.floor(Math.random() * 10), Math.floor(Math.random() * 60));

      // More recent orders are more likely to be pending/confirmed
      let status: string;
      if (daysAgo === 0) {
        status = statuses[Math.floor(Math.random() * 4)]; // pending-delivering
      } else if (daysAgo <= 2) {
        status = Math.random() > 0.3 ? 'completed' : statuses[Math.floor(Math.random() * 4)];
      } else {
        status = Math.random() > 0.15 ? 'completed' : 'cancelled';
      }

      const order = await orderModel.create({
        userId: customer._id,
        items,
        total,
        customerName: customer.fullName,
        phone: phones[ci % phones.length],
        address: addresses[(ci + oi) % addresses.length],
        note: notes[Math.floor(Math.random() * notes.length)],
        status,
      });
      // Override auto timestamps for realistic data
      await orderModel.updateOne({ _id: order._id }, { $set: { createdAt: orderDate, updatedAt: orderDate } });
      totalOrders++;
    }
  }
  console.log(`🛒 Created ${totalOrders} orders`);

  // ==================== SEED CONVERSATIONS & MESSAGES ====================

  // Helper to create messages with realistic timestamps
  async function createConversation(
    type: 'customer-staff' | 'staff-admin',
    initiator: { _id: Types.ObjectId; fullName: string; role: string },
    responder: { _id: Types.ObjectId; fullName: string; role: string },
    chatMessages: { sender: 'initiator' | 'responder'; content: string; minutesAgo: number }[],
  ) {
    const lastMsg = chatMessages[chatMessages.length - 1];
    const lastSender = lastMsg.sender === 'initiator' ? initiator : responder;

    const conv = await conversationModel.create({
      type,
      initiatorId: initiator._id,
      initiatorName: initiator.fullName,
      initiatorRole: initiator.role,
      responderId: responder._id,
      responderName: responder.fullName,
      responderRole: responder.role,
      lastMessage: lastMsg.content,
      lastMessageAt: new Date(Date.now() - lastMsg.minutesAgo * 60000),
      unreadByInitiator: lastSender.role !== initiator.role ? 1 : 0,
      unreadByResponder: lastSender.role !== responder.role ? 1 : 0,
      status: 'open',
    });

    for (const msg of chatMessages) {
      const sender = msg.sender === 'initiator' ? initiator : responder;
      const msgDoc = await messageModel.create({
        conversationId: conv._id,
        senderId: sender._id,
        senderName: sender.fullName,
        senderRole: sender.role,
        content: msg.content,
        isRead: msg !== lastMsg,
      });
      const msgTime = new Date(Date.now() - msg.minutesAgo * 60000);
      await messageModel.updateOne({ _id: msgDoc._id }, { $set: { createdAt: msgTime, updatedAt: msgTime } });
    }
    return conv;
  }

  // --- Customer ↔ Staff conversations ---

  // Customer 1 (An) ↔ Staff 1 (Bình)
  await createConversation(
    'customer-staff',
    { _id: customers[0]._id, fullName: customers[0].fullName, role: 'customer' },
    { _id: staff1._id, fullName: staff1.fullName, role: 'staff' },
    [
      { sender: 'initiator', content: 'Xin chào, tôi muốn hỏi về đơn hàng của mình', minutesAgo: 120 },
      { sender: 'responder', content: 'Chào anh An! Anh vui lòng cho em biết mã đơn hàng ạ?', minutesAgo: 118 },
      { sender: 'initiator', content: 'Đơn hàng hôm qua ấy, tôi đặt cơm sườn nướng và cánh gà BBQ', minutesAgo: 115 },
      { sender: 'responder', content: 'Dạ em kiểm tra thấy đơn hàng của anh đã được giao thành công rồi ạ. Anh có nhận được chưa?', minutesAgo: 112 },
      { sender: 'initiator', content: 'À tôi nhận rồi, cảm ơn nhé!', minutesAgo: 110 },
      { sender: 'responder', content: 'Dạ không có gì ạ! Chúc anh ngon miệng 😊', minutesAgo: 108 },
    ],
  );

  // Customer 2 (Bích) ↔ Staff 1 (Bình)
  await createConversation(
    'customer-staff',
    { _id: customers[1]._id, fullName: customers[1].fullName, role: 'customer' },
    { _id: staff1._id, fullName: staff1.fullName, role: 'staff' },
    [
      { sender: 'initiator', content: 'Shop ơi, tôi đặt nhầm địa chỉ giao hàng, có thể đổi được không?', minutesAgo: 60 },
      { sender: 'responder', content: 'Chào chị Bích! Để em kiểm tra đơn hàng giúp chị nhé. Đơn hàng đã xác nhận chưa ạ?', minutesAgo: 58 },
      { sender: 'initiator', content: 'Vẫn đang chờ xác nhận ấy', minutesAgo: 55 },
      { sender: 'responder', content: 'Dạ vậy chị vào lịch sử đơn hàng, nhấn chỉnh sửa để đổi địa chỉ được ạ. Đơn chưa xác nhận thì chỉnh sửa thoải mái luôn ạ!', minutesAgo: 53 },
      { sender: 'initiator', content: 'Ok được rồi, cảm ơn bạn nhé!', minutesAgo: 50 },
    ],
  );

  // Customer 3 (Cường) ↔ Staff 2 (Hương)
  await createConversation(
    'customer-staff',
    { _id: customers[2]._id, fullName: customers[2].fullName, role: 'customer' },
    { _id: staff2._id, fullName: staff2.fullName, role: 'staff' },
    [
      { sender: 'initiator', content: 'Cho tôi hỏi menu hôm nay có phở bò không?', minutesAgo: 45 },
      { sender: 'responder', content: 'Chào anh Cường! Để em kiểm tra menu hôm nay ạ...', minutesAgo: 43 },
      { sender: 'responder', content: 'Hôm nay có Phở bò tái chín trong menu ạ! Anh có muốn đặt không ạ?', minutesAgo: 41 },
      { sender: 'initiator', content: 'Tuyệt vời! Cho tôi 2 tô phở và 1 phần gỏi cuốn nhé', minutesAgo: 38 },
      { sender: 'responder', content: 'Dạ anh vào trang chủ rồi thêm vào giỏ hàng giúp em nhé! Em sẽ ưu tiên đơn của anh ạ 😄', minutesAgo: 35 },
      { sender: 'initiator', content: 'OK cảm ơn em!', minutesAgo: 33 },
    ],
  );

  // Customer 4 (Dung) ↔ Staff 2 (Hương)
  await createConversation(
    'customer-staff',
    { _id: customers[3]._id, fullName: customers[3].fullName, role: 'customer' },
    { _id: staff2._id, fullName: staff2.fullName, role: 'staff' },
    [
      { sender: 'initiator', content: 'Xin chào, đơn hàng của tôi giao chậm quá, đã 1 tiếng rồi', minutesAgo: 30 },
      { sender: 'responder', content: 'Chào chị Dung! Em xin lỗi về sự bất tiện này. Để em kiểm tra trạng thái đơn hàng ạ', minutesAgo: 28 },
      { sender: 'responder', content: 'Dạ đơn của chị đang trên đường giao, do khu vực chị hơi xa nên shipper cần thêm thời gian ạ. Khoảng 15 phút nữa sẽ tới ạ!', minutesAgo: 25 },
      { sender: 'initiator', content: 'Vậy ok, tôi đợi thêm. Lần sau giao nhanh hơn giúp tôi nhé', minutesAgo: 22 },
      { sender: 'responder', content: 'Dạ em ghi nhận ạ. Xin lỗi chị nhiều! FastMeal sẽ cải thiện ạ 🙏', minutesAgo: 20 },
    ],
  );

  // Customer 5 (Em) ↔ Staff 1 (Bình) — active/recent conversation
  await createConversation(
    'customer-staff',
    { _id: customers[4]._id, fullName: customers[4].fullName, role: 'customer' },
    { _id: staff1._id, fullName: staff1.fullName, role: 'staff' },
    [
      { sender: 'initiator', content: 'Chào shop! Tôi muốn đặt tiệc cho 10 người, có gói combo không?', minutesAgo: 10 },
      { sender: 'responder', content: 'Chào anh Em! Hiện tại FastMeal chưa có gói combo tiệc ạ, nhưng anh có thể đặt nhiều phần ăn trong giỏ hàng ạ!', minutesAgo: 8 },
      { sender: 'initiator', content: 'Vậy tôi đặt 10 phần cơm sườn nướng, 5 phần cánh gà BBQ, 10 lon Coca được không?', minutesAgo: 5 },
      { sender: 'responder', content: 'Dạ được ạ! Anh cứ thêm vào giỏ hàng rồi đặt hàng như bình thường nhé. Đơn lớn em sẽ ưu tiên xử lý sớm ạ!', minutesAgo: 3 },
    ],
  );

  // Customer 6 (Fương) ↔ Staff 2 (Hương) — just started
  await createConversation(
    'customer-staff',
    { _id: customers[5]._id, fullName: customers[5].fullName, role: 'customer' },
    { _id: staff2._id, fullName: staff2.fullName, role: 'staff' },
    [
      { sender: 'initiator', content: 'Shop ơi cho hỏi mấy giờ đóng cửa ạ?', minutesAgo: 2 },
    ],
  );

  console.log('💬 Created 6 customer-staff conversations');

  // --- Staff ↔ Admin conversations ---

  // Staff 1 (Bình) ↔ Admin
  await createConversation(
    'staff-admin',
    { _id: staff1._id, fullName: staff1.fullName, role: 'staff' },
    { _id: admin._id, fullName: admin.fullName, role: 'admin' },
    [
      { sender: 'initiator', content: 'Chào admin, hôm nay có nhiều đơn hàng quá, cần thêm shipper ạ', minutesAgo: 90 },
      { sender: 'responder', content: 'OK Bình, anh sẽ điều thêm 2 shipper qua khu vực đó', minutesAgo: 85 },
      { sender: 'initiator', content: 'Dạ cảm ơn admin. Còn một vấn đề nữa, khách phản hồi cánh gà cay hôm nay hơi mặn', minutesAgo: 80 },
      { sender: 'responder', content: 'Anh ghi nhận, sẽ nhắc bếp điều chỉnh. Cảm ơn Bình đã báo!', minutesAgo: 75 },
      { sender: 'initiator', content: 'Dạ vâng ạ! Ngoài ra khách hàng hỏi về gói combo tiệc, mình có dự định triển khai không ạ?', minutesAgo: 15 },
      { sender: 'responder', content: 'Ý tưởng hay đó! Anh sẽ bàn với team và thông báo sau. Bình cứ ghi nhận yêu cầu của khách nhé', minutesAgo: 12 },
    ],
  );

  // Staff 2 (Hương) ↔ Admin
  await createConversation(
    'staff-admin',
    { _id: staff2._id, fullName: staff2.fullName, role: 'staff' },
    { _id: admin._id, fullName: admin.fullName, role: 'admin' },
    [
      { sender: 'initiator', content: 'Admin ơi, chi nhánh Bình Thạnh hết nguyên liệu salad rồi ạ', minutesAgo: 200 },
      { sender: 'responder', content: 'Hương tạm thời tắt món salad trên menu đi, anh sẽ liên hệ nhà cung cấp', minutesAgo: 195 },
      { sender: 'initiator', content: 'Dạ em đã tắt rồi ạ. Khoảng bao lâu thì có lại ạ?', minutesAgo: 190 },
      { sender: 'responder', content: 'Ngày mai sáng sẽ có hàng mới. Hương nhớ bật lại món salad nhé', minutesAgo: 185 },
      { sender: 'initiator', content: 'Vâng ạ! Em có thêm một việc nữa, có khách phàn nàn giao chậm khu Bình Thạnh do xa', minutesAgo: 25 },
      { sender: 'responder', content: 'Anh sẽ xem xét mở thêm điểm trung chuyển khu vực đó. Cảm ơn Hương!', minutesAgo: 20 },
      { sender: 'initiator', content: 'Dạ cảm ơn admin ạ 🙏', minutesAgo: 18 },
    ],
  );

  console.log('💬 Created 2 staff-admin conversations');

  console.log('✅ Database seeded successfully!');

  await app.close();
}

seedDatabase().catch((error) => {
  console.error('❌ Error seeding database:', error);
  process.exit(1);
});
