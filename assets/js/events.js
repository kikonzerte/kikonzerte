/**
 * Events loader and renderer for Krienser Industrie Konzerte
 * Loads events from events.json and dynamically renders them
 */

// Function to create calendar event (.ics file)
function createCalendarEvent(event) {
  const startDate = new Date(event.date);
  const endDate = new Date(startDate.getTime() + 2 * 60 * 60 * 1000); // 2 hours duration
  
  // Format dates for iCalendar (YYYYMMDDTHHMMSS)
  const formatICalDate = (date) => {
    return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  };
  
  const icsContent = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Krienser Industrie Konzerte//Event//DE',
    'BEGIN:VEVENT',
    `UID:${event.id}@kikonzerte.ch`,
    `DTSTAMP:${formatICalDate(new Date())}`,
    `DTSTART:${formatICalDate(startDate)}`,
    `DTEND:${formatICalDate(endDate)}`,
    `SUMMARY:${event.title}`,
    `DESCRIPTION:${event.artists}\\n\\n${event.description.replace(/\n/g, '\\n')}`,
    `LOCATION:Krienser Industrie Konzerte, Kriens`,
    'END:VEVENT',
    'END:VCALENDAR'
  ].join('\r\n');
  
  // Create download link
  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${event.id}.ics`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

// Function to create email mailto link
function createEmailLink(event) {
  const subject = encodeURIComponent(`Anmeldung: ${event.title} - ${event.dateDisplay}`);
  const body = encodeURIComponent(`Hallo,\n\nich möchte mich für folgendes Konzert anmelden:\n\n${event.title}\n${event.dateDisplay}\n\nViele Grüsse`);
  return `mailto:info@kikonzerte.ch?subject=${subject}&body=${body}`;
}

// Function to render a single event card
function renderEventCard(event) {
  const card = document.createElement('article');
  card.className = 'event-card';
  card.innerHTML = `
    <img src="${event.image}" alt="${event.title}" class="event-image" loading="lazy">
    <div class="event-content">
      <h3 class="event-title">${event.title}</h3>
      <p class="event-date" data-event-id="${event.id}">${event.dateDisplay}</p>
      <p class="event-artists">${event.artists}</p>
      <p class="event-description">${event.description}</p>
      <div class="event-footer">${event.footer}</div>
      <div class="event-actions">
        <a href="${createEmailLink(event)}" class="btn btn-orange">ANMELDEN</a>
      </div>
    </div>
  `;
  
  // Add click event to date for calendar download
  const dateElement = card.querySelector('.event-date');
  dateElement.addEventListener('click', (e) => {
    e.preventDefault();
    createCalendarEvent(event);
  });
  
  return card;
}

// Function to load and display events
async function loadEvents() {
  const container = document.getElementById('events-container');
  
  try {
    const response = await fetch('events.json');
    if (!response.ok) {
      throw new Error('Failed to load events');
    }
    
    const data = await response.json();
    
    // Clear loading message
    container.innerHTML = '';
    
    // Render upcoming events
    if (data.upcoming && data.upcoming.length > 0) {
      data.upcoming.forEach(event => {
        container.appendChild(renderEventCard(event));
      });
    } else {
      container.innerHTML = '<p class="loading-message">Zurzeit sind keine Konzerte geplant. Schauen Sie bald wieder vorbei!</p>';
    }
  } catch (error) {
    console.error('Error loading events:', error);
    container.innerHTML = '<p class="loading-message">Fehler beim Laden der Konzerte. Bitte versuchen Sie es später erneut.</p>';
  }
}

// Load events when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', loadEvents);
} else {
  loadEvents();
}
