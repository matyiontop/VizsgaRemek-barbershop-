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
  const [workHours, setWorkHours] = useState([]);

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

    fetch('http://localhost:3000/api/munkaido')
      .then(res => res.json())
      .then(data => setWorkHours(data))
      .catch(err => console.error("Munkaidő hiba:", err));

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

  // Segédfüggvények az időkezeléshez
  const getHungarianDayName = (date) => {
    const days = ['Vasárnap', 'Hétfő', 'Kedd', 'Szerda', 'Csütörtök', 'Péntek', 'Szombat'];
    return days[date.getDay()];
  };

  const timeToMinutes = (timeStr) => {
    if (!timeStr) return 0;
    const [hours, minutes] = timeStr.split(':').map(Number);
    return hours * 60 + minutes;
  };

  const minutesToTime = (totalMinutes) => {
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  };

  // Időpontok generálása az adott napra
  const getTodoList = (date) => {
    if (!date) return [];
    
    // 1. Megkeressük az adott napra vonatkozó nyitvatartást
    const dayName = getHungarianDayName(date);
    const dayConfig = workHours.find(d => d.het_napja === dayName);

    // Ha nincs beállítás az adott napra (pl. Vasárnap nincs az adatbázisban), akkor zárva
    if (!dayConfig) return [];

    const dateStr = date.toISOString().split('T')[0];
    const list = [];

    // Szűrés: csak az adott napra és a kiválasztott fodrászra vonatkozó foglalások
    const dailyApps = appointments.filter(app => {
      // != használata a típuseltérések (string/number) elkerülésére, így biztosan megtalálja a foglalásokat
      if (selectedHairdresserId && app.fodrasz_id != selectedHairdresserId) return false;
      return app.idopont_datuma === dateStr;
    });

    // Nyitás, zárás és ebédidő konvertálása percekre
    const startMin = timeToMinutes(dayConfig.nyitas);
    const endMin = timeToMinutes(dayConfig.zaras);
    const lunchStartMin = timeToMinutes(dayConfig.ebed_kezdete);
    const lunchEndMin = timeToMinutes(dayConfig.ebed_vege);

    // Ciklus a nyitástól zárásig
    for (let currentMin = startMin; currentMin < endMin; currentMin += 20) {
      const time = minutesToTime(currentMin);
      let isBooked = false;
      let title = 'Szabad';

      // 1. Ebédidő ellenőrzése
      if (currentMin >= lunchStartMin && currentMin < lunchEndMin) {
        isBooked = true;
        title = 'Ebédidő';
      } else {
        // 2. Foglalások ellenőrzése
        for (const app of dailyApps) {
          const appStartMinutes = timeToMinutes(app.kezdesi_ido);
          const appDurationMinutes = (app.ido || 1) * 20;

          if (currentMin >= appStartMinutes && currentMin < appStartMinutes + appDurationMinutes) {
            isBooked = true;
            title = 'Foglalt';
            break;
          }
        }
      }

      list.push({ time, title, booked: isBooked });
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

  // Napok letiltása (múlt, hétvége, vagy betelt napok)
  const isDateDisabled = (date) => {
    // 1. Múltbéli dátumok tiltása
    if (date < new Date().setHours(0, 0, 0, 0)) return true;

    // 2. Időpontok ellenőrzése
    const list = getTodoList(date);
    
    // Ha üres a lista (pl. hétvége a getTodoList logika szerint), akkor tiltjuk
    if (list.length === 0) return true;

    // Ha minden időpont foglalt, akkor tiltjuk
    const allBooked = list.every(item => item.booked);
    return allBooked;
  };

  // Pöttyök megjelenítése (Zöld: teljesen szabad, Piros: van foglalás)
  const renderCell = (date) => {
    // Ha a nap le van tiltva (múlt, zárva, vagy tele), ne mutasson semmit
    if (isDateDisabled(date)) return null;

    const list = getTodoList(date);
    // Csak a tényleges foglalásokat nézzük, az ebédidőt ne számítsuk bele a piros jelzésbe
    const hasBooking = list.some(i => i.booked && i.title !== 'Ebédidő');

    if (!hasBooking) {
      // Ha nincs foglalás, minden szabad -> Zöld pötty
      return <Badge style={{ background: '#52c41a' }} />;
    } else {
      // Ha van foglalás (de még lehet szabad hely, vagy tele van) -> Piros pötty (alapértelmezett)
      return <Badge />;
    }
  };

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
          renderCell={renderCell} 
          onSelect={handleSelect} 
          style={{ width: 320 }} 
          disabledDate={isDateDisabled} 
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