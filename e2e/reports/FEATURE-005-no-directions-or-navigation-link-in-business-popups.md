# Feature Request: No directions or navigation link in business popups

| Field | Value |
|-------|-------|
| **Reporter** | Derek Sullivan (Visitor shopping for a Halloween costume) |
| **Priority** | 🟠 HIGH |
| **Type** | Feature Request |
| **Page** | `/map` |

## Description

I found a business on the map and clicked its marker. The popup shows some info:

> Artist Row on Broad
> 
> RETAIL
> 
> 📍 1168 Broad St, Augusta, GA 30901
> 
> 📞 (706) 955-0202
> 
> 🕐 Tue-Sat 11am-6pm

Address visible: true. Directions link: false. Maps link: false.

There's no 'Get Directions' button, no link to Google Maps or Apple Maps, and the address isn't even a clickable link that would open a maps app. I'm visiting from Atlanta — I don't know how to get around downtown Augusta. If I find a costume shop, I need to navigate there. Right now I'd have to manually copy the address, switch to Google Maps, and paste it in. That's 2005-era UX. Every modern business listing includes a one-tap 'Directions' button. This is especially important for mobile users who are physically walking around downtown trying to find businesses.

## Steps to Reproduce

1. Navigate to /map and wait for map to load
2. Click any business marker to open its popup
3. Look for a 'Get Directions' link or button — none exists
4. Look for a clickable address that opens a maps app — none exists
5. Must manually copy the address and switch to a navigation app

## Expected Behavior

Each business popup should include a 'Get Directions' button that opens Google Maps or Apple Maps with the business address pre-filled. At minimum, the address should be a clickable link (geo: URI or Google Maps URL) that launches the user's default maps app.

## Actual Behavior

Popup shows business info but no directions integration. Directions link: false. Maps link: false. Address shown: true. Address is plain text, not a clickable link.

## User Impact

Out-of-town visitors who find a business on the map have no seamless way to navigate there. The extra friction of manually copying an address means many visitors won't bother — they'll just search on Google Maps instead, bypassing this site entirely. For a site whose purpose is to drive foot traffic to downtown businesses, this is a critical gap.

## Persona Context

> **Derek Sullivan** — Derek is visiting Augusta from Atlanta for a friend's Halloween party this weekend. He needs a costume ASAP and wants to find retail shops downtown that might carry costumes, vintage clothing, or craft supplies. He's never been to downtown Augusta and is relying on this site to navigate the area quickly.
