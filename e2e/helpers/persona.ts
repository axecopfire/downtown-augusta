export interface Persona {
  name: string;
  slug: string;
  role: string;
  backstory: string;
  goals: string[];
  frustrations: string[];
}

export const MARTHA: Persona = {
  name: "Martha Kingsley",
  slug: "martha-book-tavern-owner",
  role: "Owner of The Book Tavern",
  backstory:
    "Martha has run The Book Tavern on Broad Street for 12 years. She hosts " +
    "weekly author readings and open-mic poetry nights. She heard Downtown " +
    "Augusta launched a website to promote local businesses and wants to make " +
    "sure her shop is represented well — accurate hours, upcoming events, and " +
    "a link to her social pages so customers can find her easily.",
  goals: [
    "Verify her business listing is accurate and appealing",
    "Add an upcoming author reading event linked to her shop",
    "Check that her social media links are visible to the public",
    "See how her business appears on the interactive map",
  ],
  frustrations: [
    "No way to log in as a business owner to manage her own listing",
    "Can't see customer reviews or ratings",
    "No notification system for when events are approaching",
  ],
};

export const DEREK: Persona = {
  name: "Derek Sullivan",
  slug: "derek-costume-shopper",
  role: "Visitor shopping for a Halloween costume",
  backstory:
    "Derek is visiting Augusta from Atlanta for a friend's Halloween party " +
    "this weekend. He needs a costume ASAP and wants to find retail shops " +
    "downtown that might carry costumes, vintage clothing, or craft supplies. " +
    "He's never been to downtown Augusta and is relying on this site to " +
    "navigate the area quickly.",
  goals: [
    "Search or filter businesses to find retail/costume shops",
    "Get directions or at least an address to navigate to",
    "See which shops are open right now or today",
    "Find any Halloween-themed events happening this week",
  ],
  frustrations: [
    "No search bar to find businesses by name or keyword",
    "No way to filter the map by business category",
    "Can't tell which businesses are currently open",
    "No driving directions integration",
  ],
};

export const PRIYA: Persona = {
  name: "Priya Nair",
  slug: "priya-weekend-tourist",
  role: "First-time weekend tourist",
  backstory:
    "Priya is a travel blogger from Savannah spending a long weekend in " +
    "Augusta. She wants to experience the best of downtown — great food, " +
    "live music, and local culture. She's planning her itinerary and hopes " +
    "this site will help her discover what's happening and where to eat.",
  goals: [
    "Browse upcoming events for the weekend",
    "Discover popular restaurants and cafés",
    "Plan a walking route through downtown highlights",
    "Find entertainment and nightlife options",
  ],
  frustrations: [
    "No way to filter events by date range or 'this weekend'",
    "No business ratings or popularity indicators",
    "Can't save or bookmark favorite spots for an itinerary",
    "No suggested walking routes or itinerary builder",
  ],
};

export const CARLOS: Persona = {
  name: "Carlos Rivera",
  slug: "carlos-event-organizer",
  role: "Community event organizer",
  backstory:
    "Carlos coordinates the annual 'Taste of Augusta' food truck rally and " +
    "several smaller community events. He needs the admin tools to create " +
    "events with accurate impact zones, set the right dates and times, and " +
    "link them to participating venues. He also wants to see how his events " +
    "appear on the public map.",
  goals: [
    "Create a new multi-day event with polygon impact area",
    "Link the event to multiple participating businesses",
    "Verify the event displays correctly on the public map",
    "Edit an existing event to update times and description",
  ],
  frustrations: [
    "Can only link an event to one business, not multiple",
    "No way to preview how an event will look on the public map before saving",
    "No recurring event support for weekly/monthly events",
    "No attendee count or RSVP tracking",
  ],
};

export const TAMIKA: Persona = {
  name: "Tamika Washington",
  slug: "tamika-food-blogger",
  role: "Local food blogger and Instagram influencer",
  backstory:
    "Tamika runs '@TasteAugusta' on Instagram with 15K followers. She's " +
    "always scouting new restaurants and food events downtown. She wants to " +
    "use this site to find all food-related businesses, check their social " +
    "media presence, and discover upcoming food events to feature on her blog.",
  goals: [
    "Find all restaurants and bars in the directory",
    "Check which businesses have active social media",
    "Discover food-related events like markets and festivals",
    "See social media posts from local restaurants",
  ],
  frustrations: [
    "No way to filter businesses by category on the public map",
    "Social media feeds aren't visible to the public",
    "No way to share or embed a business listing",
    "Can't see which restaurants are trending or newly added",
  ],
};

export const ALL_PERSONAS: Persona[] = [MARTHA, DEREK, PRIYA, CARLOS, TAMIKA];
