export interface EvrimaMutationInfo {
  name: string;
  viName?: string;
  category: 'Universal' | 'Carnivore' | 'Herbivore' | 'Unlockable' | 'Elder';
  description?: string;
  sourceDescription?: string;
}

/**
 * Danh mục chuẩn 41 đột biến gen (Mutations) từ IslePilot
 * Trích xuất trực tiếp 100% từ giao diện điều khiển https://islepilot.eu/dashboard/servers/cmufraiwk7fnooa01vpdzdhm4/garage
 */
export const OFFICIAL_EVRIMA_MUTATIONS: EvrimaMutationInfo[] = [
  {
    "name": "Accelerated Prey Drive",
    "viName": "Bản Năng Săn Mồi Tăng Cường",
    "category": "Carnivore",
    "description": "Gây thêm sát thương lên động vật còn ít máu.",
    "sourceDescription": "Deal more damage to animals with low health"
  },
  {
    "name": "Advanced Gestation",
    "viName": "Thai Nghén Tiến Hóa",
    "category": "Elder",
    "description": "Tăng tốc độ hình thành trứng, ấp trứng và hồi chiêu sinh sản.",
    "sourceDescription": "Increases the speed of egg creation, incubation and courtship cooldown"
  },
  {
    "name": "Augmented Tapetum",
    "viName": "Màng Phản Quang Tăng Cường",
    "category": "Carnivore",
    "description": "Tăng khả năng quan sát vào ban đêm.",
    "sourceDescription": "Have increased vision at night"
  },
  {
    "name": "Barometric Sensitivity",
    "viName": "Nhạy Cảm Khí Áp",
    "category": "Herbivore",
    "description": "Nhận được dấu hiệu cảnh báo trước bão hoặc hạn hán.",
    "sourceDescription": "Receive an indication prior to storms or droughts, no value"
  },
  {
    "name": "Cannibalistic",
    "viName": "Ăn Đồng Loại",
    "category": "Carnivore",
    "description": "Cho phép loài vốn không ăn đồng loại xem chính loài của mình là con mồi ưu tiên để nhận dinh dưỡng.",
    "sourceDescription": "For species that are not, by default, cannibals. Adds their own species as a preferred prey for nutrients, no value"
  },
  {
    "name": "Cellular Regeneration",
    "viName": "Tái Tạo Tế Bào",
    "category": "Universal",
    "description": "Hồi máu nhanh hơn.",
    "sourceDescription": "Recover health faster"
  },
  {
    "name": "Congenital Hypoalgesia",
    "viName": "Giảm Đau Bẩm Sinh",
    "category": "Universal",
    "description": "Giảm sát thương nhận vào khi chiến đấu với loài lớn hơn.",
    "sourceDescription": "Reduce incoming damage when fighting larger species"
  },
  {
    "name": "Efficient Digestion",
    "viName": "Tiêu Hóa Hiệu Quả",
    "category": "Universal",
    "description": "Thức ăn giảm chậm hơn.",
    "sourceDescription": "Your food drains more slowly"
  },
  {
    "name": "Enhanced Digestion",
    "viName": "Tăng Cường Tiêu Hóa",
    "category": "Universal",
    "description": "Giảm tốc độ hao hụt dinh dưỡng.",
    "sourceDescription": "Decrease nutrition decay rate"
  },
  {
    "name": "Enlarged meniscus",
    "viName": "Sụn Chêm Phì Đại",
    "category": "Universal",
    "description": "Sát thương do ngã sẽ trừ thể lực trước khi trừ máu.",
    "sourceDescription": "Fall damage hits stamina before draining health, no value"
  },
  {
    "name": "Epidermal Fibrosis",
    "viName": "Xơ Hóa Biểu Bì",
    "category": "Universal",
    "description": "Tăng khả năng kháng chảy máu.",
    "sourceDescription": "Increase bleed resistance"
  },
  {
    "name": "Featherweight",
    "viName": "Nhẹ Tựa Lông Hồng",
    "category": "Universal",
    "description": "Dấu chân biến mất nhanh hơn nhiều.",
    "sourceDescription": "Your footprints fade much faster"
  },
  {
    "name": "Gastronomic Regeneration",
    "viName": "Tái Tạo Qua Ăn Uống",
    "category": "Universal",
    "description": "Ăn sẽ hồi một lượng máu nhỏ.",
    "sourceDescription": "Eating restores a small amount of health"
  },
  {
    "name": "Heightened Ghrelin",
    "viName": "Ghrelin Tăng Cao",
    "category": "Universal",
    "description": "Tăng mạnh khả năng ăn vượt mức no.",
    "sourceDescription": "Increase overeating capacity by a large amount"
  },
  {
    "name": "Hematophagy",
    "viName": "Huyết Thực",
    "category": "Carnivore",
    "description": "Hồi một phần nước khi ăn.",
    "sourceDescription": "Restore some thirst when eating"
  },
  {
    "name": "Hemomania",
    "viName": "Cuồng Máu",
    "category": "Carnivore",
    "description": "Gây thêm sát thương lên mục tiêu đang chảy máu.",
    "sourceDescription": "Do extra damage on a bleeding target"
  },
  {
    "name": "Hydrodynamic",
    "viName": "Thủy Động Lực",
    "category": "Universal",
    "description": "Tăng tốc độ bơi.",
    "sourceDescription": "Increased swimming speed"
  },
  {
    "name": "Hypermetabolic Inanition",
    "viName": "Chuyển Hóa Cao Khi Đói",
    "category": "Carnivore",
    "description": "Càng đói, bạn càng gây nhiều sát thương.",
    "sourceDescription": "The less hunger you have, the more damage you deal"
  },
  {
    "name": "Hypervigilance",
    "viName": "Cảnh Giác Cao Độ",
    "category": "Herbivore",
    "description": "Mở rộng góc nhìn khi ăn và uống, đồng thời nghe tiếng bước chân của sinh vật khác rõ hơn.",
    "sourceDescription": "Increases camera angles when eating and drinking. Increases footsteps audio from others"
  },
  {
    "name": "Increased Inspiratory Capacity",
    "viName": "Tăng Dung Tích Hít Vào",
    "category": "Universal",
    "description": "Tăng dung tích ôxy khi lặn.",
    "sourceDescription": "Increased O2 capacity"
  },
  {
    "name": "Infrasound Communication",
    "viName": "Giao Tiếp Hạ Âm",
    "category": "Universal",
    "description": "Giảm đáng kể tiếng động phát ra khi trò chuyện.",
    "sourceDescription": "Make significantly less noise when talking in chat"
  },
  {
    "name": "Multichambered Lungs",
    "viName": "Phổi Đa Ngăn",
    "category": "Universal",
    "description": "Giảm ngưỡng cần thiết để bắt đầu hồi thể lực.",
    "sourceDescription": "Reduce stamina regeneration threshold"
  },
  {
    "name": "Nocturnal",
    "viName": "Hoạt Động Về Đêm",
    "category": "Universal",
    "description": "Hồi máu và phần máu bị khóa nhanh hơn vào ban đêm.",
    "sourceDescription": "Faster health / locked health recovery during the night"
  },
  {
    "name": "Osteophagic",
    "viName": "Thực Cốt",
    "category": "Carnivore",
    "description": "Có thể ăn xương để hồi phục gãy xương nhanh hơn.",
    "sourceDescription": "Able to consume bones to regenerate fractures faster"
  },
  {
    "name": "Osteosclerosis",
    "viName": "Xơ Cứng Xương",
    "category": "Universal",
    "description": "Kháng hoặc giảm sát thương gây gãy xương.",
    "sourceDescription": "Resist or Reduce Fracture damage"
  },
  {
    "name": "Parthenogenesis",
    "viName": "Trinh Sản",
    "category": "Unlockable",
    "description": "Cho phép làm tổ mà không cần bạn đời.",
    "sourceDescription": "Allows the player to nest without a mate, no value"
  },
  {
    "name": "Photosynthetic Regeneration",
    "viName": "Tái Tạo Quang Hợp",
    "category": "Herbivore",
    "description": "Hồi thể lực nhanh hơn vào ban ngày.",
    "sourceDescription": "Regenerates stamina faster during the day"
  },
  {
    "name": "Photosynthetic Tissue",
    "viName": "Mô Quang Hợp",
    "category": "Universal",
    "description": "Hồi máu và phần máu bị khóa nhanh hơn vào ban ngày.",
    "sourceDescription": "Faster health / locked health recovery during the day"
  },
  {
    "name": "Prolific Reproduction",
    "viName": "Sinh Sản Sung Mãn",
    "category": "Universal",
    "description": "Con non hồi máu và thể lực nhanh hơn, cần ít thức ăn hơn và lớn nhanh hơn.",
    "sourceDescription": "Your babies have increased health and stamina regen. Your babies require less food. Your babies grow faster"
  },
  {
    "name": "Reabsorption",
    "viName": "Tái Hấp Thu",
    "category": "Universal",
    "description": "Hồi một ít nước khi trời mưa hoặc khi bơi trong nguồn nước có thể uống.",
    "sourceDescription": "Recover a small amount of water during the rainy weather or while swimming in drinkable water"
  },
  {
    "name": "Reinforced Tendons",
    "viName": "Gân Cốt Gia Cố",
    "category": "Universal",
    "description": "Nhảy tiêu hao ít thể lực hơn.",
    "sourceDescription": "Jumping costs less stamina"
  },
  {
    "name": "Reniculate Kidneys",
    "viName": "Thận Dạng Thùy",
    "category": "Universal",
    "description": "Có thể uống nước mặn.",
    "sourceDescription": "Can drink saltwater, no value"
  },
  {
    "name": "Sequential Hermaphroditism",
    "viName": "Lưỡng Tính Tuần Tự",
    "category": "Universal",
    "description": "Chọn đột biến này sẽ đổi giới tính nhân vật; không di truyền cho con non.",
    "sourceDescription": "Taking this mutation will change your asset sex. Does not inherit by offspring, no value"
  },
  {
    "name": "Social Behavior",
    "viName": "Tập Tính Xã Hội",
    "category": "Universal",
    "description": "Tăng giới hạn số thành viên nhóm; chỉ áp dụng cho trưởng nhóm.",
    "sourceDescription": "Increased group size. Only applies to group leader"
  },
  {
    "name": "Submerged Optical Retention",
    "viName": "Duy Trì Thị Lực Dưới Nước",
    "category": "Universal",
    "description": "Tăng tầm nhìn dưới nước.",
    "sourceDescription": "Increased underwater vision range"
  },
  {
    "name": "Sustained Hydration",
    "viName": "Giữ Nước Bền Bỉ",
    "category": "Universal",
    "description": "Nước giảm chậm hơn.",
    "sourceDescription": "Your water drains more slowly"
  },
  {
    "name": "Tactile Endurance",
    "viName": "Chịu Đòn Dẻo Dai",
    "category": "Universal",
    "description": "Chuyển sát thương nhận vào thành hao hụt thể lực.",
    "sourceDescription": "Convert incoming damage to stamina"
  },
  {
    "name": "Traumatic Thrombosis",
    "viName": "Huyết Khối Chấn Thương",
    "category": "Universal",
    "description": "Giảm mức độ choáng váng và kháng chấn thương mô mềm nặng.",
    "sourceDescription": "Resist severe trauma and mitigate heavy stagger"
  },
  {
    "name": "Truculency",
    "viName": "Hung Bạo",
    "category": "Herbivore",
    "description": "Tăng khả năng hất văng sinh vật đang bám vào cơ thể.",
    "sourceDescription": "Bucking has a higher chance to dismount latched animals"
  },
  {
    "name": "Wader",
    "viName": "Thích Nghi Lội Nước",
    "category": "Universal",
    "description": "Ít bị cản trở hơn khi lội qua vùng nước nông.",
    "sourceDescription": "Less hindered when wading through shallow water"
  },
  {
    "name": "Xerocole Adaptation",
    "viName": "Thích Nghi Khô Hạn",
    "category": "Herbivore",
    "description": "Nhận một lượng nước khi ăn thực vật.",
    "sourceDescription": "Gain some water when eating plants"
  }
];

export const ALL_MUTATION_NAMES: string[] = OFFICIAL_EVRIMA_MUTATIONS.map((m) => m.name);
