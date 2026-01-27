import React from 'react';
import { Calendar, Badge, List, HStack, SelectPicker } from 'rsuite';
import 'rsuite/dist/rsuite.min.css';

function getTodoList(date) {
  if (!date) {
    return [];
  }
  const day = date.getDay();

  // Szombat (6) és Vasárnap (0) kizárása
  if (day === 0 || day === 6) {
    return [];
  }

  const list = [];
  // 08:00 - 16:00 között 20 percenként generálás
  for (let hour = 8; hour < 16; hour++) {
    for (let min = 0; min < 60; min += 20) {
      const time = `${hour.toString().padStart(2, '0')}:${min.toString().padStart(2, '0')}`;
      // Demonstráció: 11:00 és 14:20 foglaltnak jelölése
      const isBooked = time === '12:00';
      list.push({ time, title: isBooked ? 'Foglalt' : 'Szabad időpont', booked: isBooked });
    }
  }

  return list;
}

function renderCell(date) {
  const list = getTodoList(date);

  if (list.length) {
    return <Badge className="calendar-todo-item-badge" />;
  }

  return null;
}

const Naptar = () => {
  const [selectedDate, setSelectedDate] = React.useState(null);
  const [selectedTime, setSelectedTime] = React.useState(null);
  const [durationMultiplier, setDurationMultiplier] = React.useState(1);

  const handleSelect = date => {
    setSelectedDate(date);
    setSelectedTime(null);
  };

  const disabledDate = (date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date < today;
  };

  const services = [
    { label: '20', value: '1' },
    { label: '40', value: '2' },
    { label: '1h', value: '3' }
  ];

  const list = getTodoList(selectedDate);

  const isSelectionValid = () => {
    if (!selectedTime || list.length === 0) return false;
    const index = list.findIndex(item => item.time === selectedTime);
    if (index === -1) return false;
    // Ellenőrizzük, hogy a kiválasztott időponttól kezdve van-e elég szabad hely
    if (index + durationMultiplier > list.length) return false;

    for (let i = 0; i < durationMultiplier; i++) {
      if (list[index + i].booked) return false;
    }

    return true;
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <SelectPicker 
        data={services} 
        style={{ width: 224 }} 
        placeholder="Válassz szolgáltatást" 
        defaultValue="1"
        cleanable={false}
        onChange={(value) => setDurationMultiplier(parseInt(value, 10) || 1)}
      />
      
      <HStack spacing={10} style={{ height: 400 }} alignItems="flex-start" wrap>
        <Calendar compact renderCell={renderCell} onSelect={handleSelect} style={{ width: 320 }} disabledDate={disabledDate} />
        <div style={{ flex: 1, height: '100%', display: 'flex', flexDirection: 'column' }}>
          <div style={{ flex: 1, overflowY: 'auto' }}>
            <TodoList list={list} selectedTime={selectedTime} onSelect={setSelectedTime} durationMultiplier={durationMultiplier} />
          </div>
          {isSelectionValid() && (
            <button className="bej-reg_gomb" style={{ marginTop: 10, width: '100%' }}>
              Foglalás
            </button>
          )}
        </div>
      </HStack>
    </div>
  );
};

const TodoList = ({ list, selectedTime, onSelect, durationMultiplier }) => {
  if (!list.length) {
    return (
      <div style={{ padding: 10, color: '#999' }}>
        Válassz egy napot (H-P) a szabad időpontokhoz.
      </div>
    );
  }

  const selectedIndex = list.findIndex(item => item.time === selectedTime);
  let hasOverlap = false;

  if (selectedIndex !== -1) {
    for (let i = 0; i < durationMultiplier; i++) {
      if (list[selectedIndex + i]?.booked) {
        hasOverlap = true;
        break;
      }
    }
  }

  return (
    <List bordered hover>
      {list.map((item, index) => {
        let style = { cursor: 'pointer' };

        if (item.booked) {
          style.background = '#ffcccc'; // Pirosas a foglaltnak
        }

        if (selectedIndex !== -1 && index >= selectedIndex && index < selectedIndex + durationMultiplier) {
          style.background = hasOverlap ? '#ffffcc' : '#ccffcc'; // Sárga ha ütközik, Zöld ha ok
        }

        return (
          <List.Item 
            key={item.time} 
            index={item.time} 
            onClick={() => onSelect(item.time)}
            style={style}
          >
            <div>{item.time}</div>
            <div>{item.title}</div>
          </List.Item>
        );
      })}
    </List>
  );
};

export default Naptar;