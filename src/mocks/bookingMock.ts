import type { BookingResponse } from '../types/booking';

export const MOCK_BOOKING_DATA: BookingResponse = {
  available_days: [
    "2025-04-04",
    "2025-04-05",
    "2025-04-06",
    "2025-04-07",
    "2025-04-08"
  ],
  current_day: "2025-04-04",
  restaurant: {
    id: 1,
    timezone: "Asia/Vladivostok",
    restaurant_name: "Супра",
    opening_time: "11:00",
    closing_time: "23:40"
  },
  tables: [
    {
      id: "t1",
      number: "Стол 1",
      capacity: 4,
      zone: "1 этаж",
      orders: [
        {
          id: "ord-101",
          status: "New",
          start_time: "11:30",
          end_time: "13:00"
        },
        {
          id: "ord-102",
          status: "Bill",
          start_time: "14:15",
          end_time: "15:45"
        },
        {
          id: "ord-103",
          status: "Closed",
          start_time: "18:00",
          end_time: "20:00"
        }
      ],
      reservations: [
        {
          id: 501,
          name_for_reservation: "Иван Петров",
          num_people: 3,
          phone_number: "+7 (999) 123-45-67",
          status: "Новая",
          seating_time: "11:30",
          end_time: "13:00"
        },
        {
          id: 502,
          name_for_reservation: "Ольга Смирнова",
          num_people: 4,
          phone_number: "+7 (999) 765-43-21",
          status: "Заявка",
          seating_time: "16:00",
          end_time: "17:30"
        }
      ]
    },
    {
      id: "t2",
      number: "Стол 2",
      capacity: 2,
      zone: "1 этаж",
      orders: [
        {
          id: "ord-201",
          status: "Closed",
          start_time: "12:00",
          end_time: "13:30"
        }
      ],
      reservations: [
        {
          id: 503,
          name_for_reservation: "Алексей Соколов",
          num_people: 2,
          phone_number: "+7 (999) 111-22-33",
          status: "Открыт",
          seating_time: "12:00",
          end_time: "13:30"
        },
        {
          id: 504,
          name_for_reservation: "Дмитрий Волков",
          num_people: 2,
          phone_number: "+7 (999) 444-55-66",
          status: "Новая",
          seating_time: "19:00",
          end_time: "21:00"
        }
      ]
    },
    {
      id: "t3",
      number: "Стол 3",
      capacity: 6,
      zone: "1 этаж",
      orders: [],
      reservations: [
        {
          id: 505,
          name_for_reservation: "Елена Кузнецова",
          num_people: 5,
          phone_number: "+7 (999) 777-88-99",
          status: "Живая очередь",
          seating_time: "13:00",
          end_time: "15:00"
        }
      ]
    },
    {
      id: "t4",
      number: "Стол 4",
      capacity: 4,
      zone: "2 этаж",
      orders: [
        {
          id: "ord-401",
          status: "Banquet",
          start_time: "15:00",
          end_time: "19:00"
        }
      ],
      reservations: [
        {
          id: 506,
          name_for_reservation: "Юбилей Марии",
          num_people: 4,
          phone_number: "+7 (999) 888-99-00",
          status: "Новая",
          seating_time: "15:00",
          end_time: "19:00"
        }
      ]
    },
    {
      id: "t5",
      number: "Стол 5",
      capacity: 2,
      zone: "2 этаж",
      orders: [],
      reservations: [
        {
          id: 507,
          name_for_reservation: "Артем Морозов",
          num_people: 2,
          phone_number: "+7 (999) 555-44-33",
          status: "Заявка",
          seating_time: "11:00",
          end_time: "12:30"
        },
        {
          id: 508,
          name_for_reservation: "Анна Новикова",
          num_people: 2,
          phone_number: "+7 (999) 222-33-44",
          status: "Закрыт",
          seating_time: "21:30",
          end_time: "23:00"
        }
      ]
    },
    {
      id: "t6",
      number: "VIP Кабинет",
      capacity: 12,
      zone: "Банкетный зал",
      orders: [],
      reservations: [
        {
          id: 509,
          name_for_reservation: "Корпоратив ООО Вектор",
          num_people: 12,
          phone_number: "+7 (900) 123-45-67",
          status: "Новая",
          seating_time: "17:00",
          end_time: "23:00"
        }
      ]
    },
    {
      id: "t7",
      number: "Стол 11",
      capacity: 6,
      zone: "2 этаж",
      orders: [],
      reservations: []
    },
    {
      id: "t8",
      number: "Банкет 1",
      capacity: 10,
      zone: "Банкетный зал",
      orders: [
        {
          id: "ord-801",
          status: "Banquet",
          start_time: "13:00",
          end_time: "16:30"
        }
      ],
      reservations: []
    }
  ]
};
