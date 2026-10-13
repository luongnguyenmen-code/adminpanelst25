export interface EvrimaMutationInfo {
  name: string;
  category: 'Universal' | 'Carnivore' | 'Herbivore' | 'Unlockable' | 'Elder';
  description?: string;
}

export const OFFICIAL_EVRIMA_MUTATIONS: EvrimaMutationInfo[] = [
  // Universal Lifecycle Mutations
  { name: 'Absorptive Gut', category: 'Universal', description: 'Tăng hấp thụ dinh dưỡng từ thức ăn' },
  { name: 'Cellular Regeneration', category: 'Universal', description: 'Hồi phục máu nhanh hơn (+15% đến +25%)' },
  { name: 'Congenital Hypoalgesia', category: 'Universal', description: 'Giảm sát thương nhận vào khi đấu với loài to hơn' },
  { name: 'Efficient Digestion', category: 'Universal', description: 'Thức ăn tụt chậm hơn (+20% đến +30%)' },
  { name: 'Endurance', category: 'Universal', description: 'Tăng thể lực bền bỉ khi di chuyển đường dài' },
  { name: 'Enlarged Meniscus', category: 'Universal', description: 'Sát thương rơi trừ vào thể lực trước khi trừ máu' },
  { name: 'Epidermal Fibrosis', category: 'Universal', description: 'Tăng kháng chảy máu (Bleed resistance)' },
  { name: 'Featherweight', category: 'Universal', description: 'Dấu chân mờ nhanh hơn gấp 2 lần' },
  { name: 'Gastronomic Regeneration', category: 'Universal', description: 'Ăn uống giúp hồi phục một lượng máu nhỏ' },
  { name: 'Heightened Ghrelin', category: 'Universal', description: 'Tăng tốc độ thèm ăn để tiêu hóa nhanh' },
  { name: 'Hydrodynamic', category: 'Universal', description: 'Tăng tốc độ bơi lội dưới nước' },
  { name: 'Hydroregenerative', category: 'Universal', description: 'Hồi phục máu nhanh hơn khi trời đổ mưa' },
  { name: 'Increased Inspiratory Capacity', category: 'Universal', description: 'Tăng dung tích oxy nín thở dưới nước' },
  { name: 'Multichambered Lungs', category: 'Universal', description: 'Phổi nhiều ngăn, tăng sức bền hô hấp' },
  { name: 'Nocturnal Sight', category: 'Universal', description: 'Tầm nhìn ban đêm sáng rõ hơn' },
  { name: 'Photoreceptive', category: 'Universal', description: 'Tăng cường thụ cảm quang học của mắt' },
  { name: 'Photosynthetic Tissue', category: 'Universal', description: 'Hồi phục sinh lực nhanh hơn dưới ánh mặt trời' },
  { name: 'Pneumatic Bones', category: 'Universal', description: 'Xương rỗng khí, di chuyển nhẹ nhàng' },
  { name: 'Prolific Reproduction', category: 'Universal', description: 'Tăng tỷ lệ sinh sản và số lượng trứng' },
  { name: 'Reabsorption', category: 'Universal', description: 'Tái hấp thu chất dinh dưỡng khi đói' },
  { name: 'Reniculate Kidneys', category: 'Universal', description: 'Thận lọc tăng cường, thanh lọc độc tố' },
  { name: 'Sclerocorneal', category: 'Universal', description: 'Củng mạc mắt cứng cáp, kháng chấn thương mắt' },
  { name: 'Sequential Hermaphroditism', category: 'Universal', description: 'Thích nghi di truyền giống loài' },
  { name: 'Socialite', category: 'Universal', description: 'Tăng lợi thế bầy đàn và giảm căng thẳng' },
  { name: 'Sustained Hydration', category: 'Universal', description: 'Nước uống tụt chậm hơn (+20% thời gian)' },
  { name: 'Tactile Endurance', category: 'Universal', description: 'Chuyển một phần sát thương nhận vào thành thể lực' },
  { name: 'Thick Hide', category: 'Universal', description: 'Lớp da dày, tăng kháng sát thương vật lý' },
  { name: 'Xenomorphic Instinct', category: 'Universal', description: 'Bản năng sinh tồn nhạy bén, cảnh giác cao' },

  // Carnivore-Specific Mutations
  { name: 'Accelerated Prey Drive', category: 'Carnivore', description: 'Gây thêm sát thương lên con mồi còn ít máu' },
  { name: 'Augmented Tapetum', category: 'Carnivore', description: 'Mắt mèo ban đêm cực sáng (mở khóa khi săn đêm)' },
  { name: 'Cannibalistic', category: 'Carnivore', description: 'Cho phép ăn thịt đồng loại lấy trọn vẹn dinh dưỡng' },
  { name: 'Hematophagy', category: 'Carnivore', description: 'Ăn xác thịt giúp hồi phục thanh nước uống' },
  { name: 'Hemomania', category: 'Carnivore', description: 'Tăng sát thương lên đối thủ đang bị chảy máu' },
  { name: 'Hypermetabolic Inanition', category: 'Carnivore', description: 'Sát thương tăng vọt khi máu bản thân xuống thấp' },
  { name: 'Osteophagic', category: 'Carnivore', description: 'Ăn xương để hồi phục gãy chân cực nhanh' },
  { name: 'Osteosclerosis', category: 'Carnivore', description: 'Mật độ xương đặc, giảm tối đa nguy cơ gãy chân' },

  // Herbivore-Specific Mutations
  { name: 'Barometric Sensitivity', category: 'Herbivore', description: 'Dự báo bão và thời tiết khắc nghiệt trước thời gian' },
  { name: 'Hypervigilance', category: 'Herbivore', description: 'Mở rộng góc nhìn 50% khi ăn/uống & nghe bước chân từ xa' },
  { name: 'Photosynthetic Regeneration', category: 'Herbivore', description: 'Hồi phục thể lực nhanh hơn vào ban ngày' },
  { name: 'Truculency', category: 'Herbivore', description: 'Tăng khả năng hất văng kẻ săn mồi bám vào cơ thể' },
  { name: 'Xerocole Adaptation', category: 'Herbivore', description: 'Ăn cây cỏ giúp hồi phục thêm thanh nước uống' },

  // Elder / Special Lifestyle Mutations
  { name: 'Advanced Gestation', category: 'Elder', description: 'Rút ngắn thời gian mang thai trứng (Dành riêng cho Khủng long Cái)' },
  { name: 'Filtered Kidneys', category: 'Unlockable', description: 'Thận lọc nước biển mặn uống an toàn' },
  { name: 'Parthenogenesis', category: 'Unlockable', description: 'Khả năng sinh sản đơn tính di truyền' },
  { name: 'Reinforced Tendons', category: 'Unlockable', description: 'Gân cơ cường lực, tăng độ bật nhảy' },
];

export const ALL_MUTATION_NAMES: string[] = OFFICIAL_EVRIMA_MUTATIONS.map((m) => m.name);
