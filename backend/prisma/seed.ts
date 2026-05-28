import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱  Iniciando seed...');

  // Categorias
  const categories = await Promise.all([
    prisma.category.upsert({ where: { slug: 'hamburguer' }, update: {}, create: { name: 'Hambúrguer', icon: '🍔', slug: 'hamburguer' } }),
    prisma.category.upsert({ where: { slug: 'pizza' }, update: {}, create: { name: 'Pizza', icon: '🍕', slug: 'pizza' } }),
    prisma.category.upsert({ where: { slug: 'sushi' }, update: {}, create: { name: 'Sushi', icon: '🍣', slug: 'sushi' } }),
    prisma.category.upsert({ where: { slug: 'brasileira' }, update: {}, create: { name: 'Brasileira', icon: '🥘', slug: 'brasileira' } }),
    prisma.category.upsert({ where: { slug: 'sobremesas' }, update: {}, create: { name: 'Sobremesas', icon: '🍰', slug: 'sobremesas' } }),
    prisma.category.upsert({ where: { slug: 'saudavel' }, update: {}, create: { name: 'Saudável', icon: '🥗', slug: 'saudavel' } }),
    prisma.category.upsert({ where: { slug: 'bebidas' }, update: {}, create: { name: 'Bebidas', icon: '🥤', slug: 'bebidas' } }),
    prisma.category.upsert({ where: { slug: 'acai' }, update: {}, create: { name: 'Açaí', icon: '🫐', slug: 'acai' } }),
    prisma.category.upsert({ where: { slug: 'tapioca' }, update: {}, create: { name: 'Tapioca', icon: '🫓', slug: 'tapioca' } }),
    prisma.category.upsert({ where: { slug: 'arabe' }, update: {}, create: { name: 'Árabe', icon: '🧆', slug: 'arabe' } }),
  ]);
  console.log(`✅  ${categories.length} categorias`);

  const [hamburguer, pizza, sushi] = categories;

  // Restaurantes
  const burger = await prisma.restaurant.upsert({
    where: { slug: 'smash-burguer' },
    update: {},
    create: {
      name: 'Smash Burguer',
      slug: 'smash-burguer',
      logo: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=100&h=100&fit=crop',
      coverImage: 'https://images.unsplash.com/photo-1550547660-d9450f859349?w=800&h=400&fit=crop',
      description: 'Os melhores smash burgers da cidade',
      rating: 4.8,
      reviewCount: 1420,
      deliveryTime: 30,
      deliveryFee: 0,
      minOrder: 25,
      isOpen: true,
      categoryId: hamburguer.id,
    },
  });

  await prisma.menuItem.createMany({
    skipDuplicates: true,
    data: [
      { name: 'Smash Clássico', description: 'Blend 180g, queijo cheddar, alface, tomate', price: 28.9, image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=300&h=200&fit=crop', sectionTitle: 'Burgers', restaurantId: burger.id },
      { name: 'Smash Duplo', description: 'Dois blends 180g, queijo duplo, bacon', price: 42.9, image: 'https://images.unsplash.com/photo-1553979459-d2229ba7433b?w=300&h=200&fit=crop', sectionTitle: 'Burgers', restaurantId: burger.id },
      { name: 'Batata Frita', description: 'Porção 300g crocante', price: 14.9, image: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=300&h=200&fit=crop', sectionTitle: 'Acompanhamentos', restaurantId: burger.id },
      { name: 'Milkshake Baunilha', description: '400ml', price: 18.0, image: 'https://images.unsplash.com/photo-1572490122747-3e9523c9b7a3?w=300&h=200&fit=crop', sectionTitle: 'Bebidas', restaurantId: burger.id },
    ],
  });

  const pizzaria = await prisma.restaurant.upsert({
    where: { slug: 'napoli-pizza' },
    update: {},
    create: {
      name: 'Napoli Pizza',
      slug: 'napoli-pizza',
      logo: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=100&h=100&fit=crop',
      coverImage: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800&h=400&fit=crop',
      description: 'Pizzas artesanais assadas em forno a lenha',
      rating: 4.6,
      reviewCount: 890,
      deliveryTime: 45,
      deliveryFee: 5.99,
      minOrder: 40,
      isOpen: true,
      categoryId: pizza.id,
    },
  });

  await prisma.menuItem.createMany({
    skipDuplicates: true,
    data: [
      { name: 'Margherita', description: 'Molho san marzano, mussarela de búfala, manjericão', price: 52.9, image: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=300&h=200&fit=crop', sectionTitle: 'Tradicionais', restaurantId: pizzaria.id },
      { name: 'Pepperoni', description: 'Molho tomate, mussarela, pepperoni italiano', price: 59.9, image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=300&h=200&fit=crop', sectionTitle: 'Tradicionais', restaurantId: pizzaria.id },
      { name: 'Quatro Queijos', description: 'Gorgonzola, parmesão, mussarela, provolone', price: 62.9, image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=300&h=200&fit=crop', sectionTitle: 'Especiais', restaurantId: pizzaria.id },
      { name: 'Nutella', description: 'Nutella, morango fresco, leite condensado', price: 45.0, image: 'https://images.unsplash.com/photo-1571115177098-24ec42ed204d?w=300&h=200&fit=crop', sectionTitle: 'Doces', restaurantId: pizzaria.id },
    ],
  });

  const sushiRest = await prisma.restaurant.upsert({
    where: { slug: 'sakura-sushi' },
    update: {},
    create: {
      name: 'Sakura Sushi',
      slug: 'sakura-sushi',
      logo: 'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=100&h=100&fit=crop',
      coverImage: 'https://images.unsplash.com/photo-1617196034183-421b4040ed20?w=800&h=400&fit=crop',
      description: 'Culinária japonesa autêntica',
      rating: 4.9,
      reviewCount: 2100,
      deliveryTime: 50,
      deliveryFee: 8.0,
      minOrder: 60,
      isOpen: true,
      categoryId: sushi.id,
    },
  });

  await prisma.menuItem.createMany({
    skipDuplicates: true,
    data: [
      { name: 'Combo 30 peças', description: 'Seleção do chef: nigiri, sashimi e uramaki', price: 89.9, image: 'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=300&h=200&fit=crop', sectionTitle: 'Combos', restaurantId: sushiRest.id },
      { name: 'Temaki Salmão', description: 'Salmão fresco, cream cheese, pepino', price: 22.9, image: 'https://images.unsplash.com/photo-1617196034183-421b4040ed20?w=300&h=200&fit=crop', sectionTitle: 'Temakis', restaurantId: sushiRest.id },
      { name: 'Gyoza (6 un)', description: 'Pastelzinho japonês com molho ponzu', price: 19.9, image: 'https://images.unsplash.com/photo-1496116218417-1a781b1c416c?w=300&h=200&fit=crop', sectionTitle: 'Entradas', restaurantId: sushiRest.id },
      { name: 'Missoshiro', description: 'Sopa tradicional com tofu e cebolinha', price: 12.0, image: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=300&h=200&fit=crop', sectionTitle: 'Sopas', restaurantId: sushiRest.id },
    ],
  });

  // Usuário de teste
  const hashed = await bcrypt.hash('123456', 12);
  await prisma.user.upsert({
    where: { email: 'test@ifood.com' },
    update: {},
    create: { name: 'Usuário Teste', email: 'test@ifood.com', password: hashed },
  });

  console.log('✅  Seed concluído!');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
