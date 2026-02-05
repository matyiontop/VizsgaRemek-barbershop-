import React, { useState, useEffect } from 'react';
import { Calendar, Badge, List, HStack, SelectPicker, Button, useToaster, Message } from 'rsuite';
import 'rsuite/dist/rsuite.min.css';

const Naptar = () => {
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  
  // Adatok a backendről
  const [services, setServices] = useState([]);
  const [hairdressers, setHairdressers] = useState([]);
  const [appointments, setAppointments] = useState([]);

  // Kiválasztott értékek
  const [selectedServiceId, setSelectedServiceId] = useState(null);
  const [selectedHairdresserId, setSelectedHairdresserId] = useState(null);

  const toaster = useToaster();

  // Adatok betöltése induláskor
  useEffect(() => {
    fetch('http://localhost:3000/api/szolgaltatasok')
      .then(res => res.json())
      .then(data => setServices(data))
      .catch(err => console.error("Szolgáltatás hiba:", err));

    fetch('http://localhost:3000/api/fodraszok')
      .then(res => res.json())
      .then(data => {
        setHairdressers(data);
        // Mivel csak egy fodrász van, automatikusan kiválasztjuk az elsőt, hogy a foglalás működjön
        if (data.length > 0) {
          setSelectedHairdresserId(data[0].fodrasz_id);
        }
      })
      .catch(err => console.error("Fodrász hiba:", err));

    fetchAppointments();
  }, []);

  const fetchAppointments = () => {
    fetch('http://localhost:3000/api/idopontok')
      .then(res => res.json())
      .then(data => setAppointments(data))
      .catch(err => console.error("Időpont hiba:", err));
  };

  // Szolgáltatás időtartamának kiszámítása (hányszor 20 perc)
  const getDurationMultiplier = () => {
    if (!selectedServiceId) return 1;
    const service = services.find(s => s.szolgaltatas_id === selectedServiceId);
    // A backend 'idotartam_perc'-et küld, ezt osztjuk 20-szal
    return service ? Math.ceil(service.idotartam_perc / 20) : 1;
  };

  const durationMultiplier = getDurationMultiplier();

  // Időpontok generálása az adott napra
  const getTodoList = (date) => {
    if (!date) return [];
    const day = date.getDay();
    if (day === 0 || day === 6) return []; // Hétvége zárva

    const dateStr = date.toISOString().split('T')[0];
    const list = [];

    // Szűrés: csak az adott napra és a kiválasztott fodrászra vonatkozó foglalások
    const dailyApps = appointments.filter(app => {
      // != használata a típuseltérések (string/number) elkerülésére, így biztosan megtalálja a foglalásokat
      if (selectedHairdresserId && app.fodrasz_id != selectedHairdresserId) return false;
      return app.idopont_datuma === dateStr;
    });

    for (let hour = 8; hour < 16; hour++) {
      for (let min = 0; min < 60; min += 20) {
        const time = `${hour.toString().padStart(2, '0')}:${min.toString().padStart(2, '0')}`;
        
        // Ellenőrizzük, hogy ez az időpont foglalt-e
        let isBooked = false;
        const currentMinutes = hour * 60 + min;

        for (const app of dailyApps) {
          const [appH, appM] = app.kezdesi_ido.split(':').map(Number);
          const appStartMinutes = appH * 60 + appM;
          // app.ido az egységek száma (pl. 2), szorozva 20 perccel
          const appDurationMinutes = (app.ido || 1) * 20;

          if (currentMinutes >= appStartMinutes && currentMinutes < appStartMinutes + appDurationMinutes) {
            isBooked = true;
            break;
          }
        }

        list.push({ time, title: isBooked ? 'Foglalt' : 'Szabad', booked: isBooked });
      }
    }
    return list;
  };

  const list = getTodoList(selectedDate);

  const handleSelect = date => {
    setSelectedDate(date);
    setSelectedTime(null);
  };

  const isSelectionValid = () => {
    if (!selectedTime || list.length === 0 || !selectedHairdresserId || !selectedServiceId) return false;
    const index = list.findIndex(item => item.time === selectedTime);
    if (index === -1) return false;
    if (index + durationMultiplier > list.length) return false;

    for (let i = 0; i < durationMultiplier; i++) {
      if (list[index + i].booked) return false;
    }
    return true;
  };

  const handleBooking = async () => {
    const userStr = localStorage.getItem('user');
    if (!userStr) {
      toaster.push(<Message type="error">Jelentkezz be a foglaláshoz!</Message>);
      return;
    }
    const user = JSON.parse(userStr);

    const body = {
      felhasznalo_id: user.felhasznalo_id,
      fodrasz_id: selectedHairdresserId,
      szolgaltatas_id: selectedServiceId,
      idopont_datuma: selectedDate.toISOString().split('T')[0],
      kezdesi_ido: selectedTime
    };

    try {
      const res = await fetch('http://localhost:3000/api/idopontok', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      
      if (res.ok) {
        toaster.push(<Message type="success">Sikeres foglalás!</Message>);
        fetchAppointments(); // Naptár frissítése
        setSelectedTime(null);
      } else {
        const err = await res.json();
        toaster.push(<Message type="error">{err.error || 'Hiba történt'}</Message>);
      }
    } catch (e) {
      toaster.push(<Message type="error">Hálózati hiba</Message>);
    }
  };

  // Adatok formázása a SelectPicker-hez
  const serviceData = services.map(s => ({
    label: `${s.tipus} (${s.idotartam_perc} perc) - ${s.ar} Ft`,
    value: s.szolgaltatas_id
  }));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <HStack spacing={10}>
        <SelectPicker 
          data={serviceData} 
          style={{ width: 250 }} 
          placeholder="Válassz szolgáltatást" 
          onChange={setSelectedServiceId}
        />
      </HStack>
      
      <HStack spacing={10} style={{ height: 400 }} alignItems="flex-start" wrap>
        <Calendar 
          compact 
          renderCell={(date) => {
            // Csak akkor mutatunk pöttyöt, ha van foglalás aznapra a választott fodrásznál
            const items = getTodoList(date).filter(i => i.booked);
            return items.length ? <Badge /> : null;
          }} 
          onSelect={handleSelect} 
          style={{ width: 320 }} 
          disabledDate={date => date < new Date().setHours(0,0,0,0)} 
        />
        
        <div style={{ flex: 1, height: '100%', display: 'flex', flexDirection: 'column' }}>
          <div style={{ flex: 1, overflowY: 'auto' }}>
            <TodoList list={list} selectedTime={selectedTime} onSelect={setSelectedTime} durationMultiplier={durationMultiplier} />
          </div>
          {isSelectionValid() && (
            <Button appearance="primary" color="green" style={{ marginTop: 10, width: '100%' }} onClick={handleBooking}>
              Foglalás
            </Button>
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