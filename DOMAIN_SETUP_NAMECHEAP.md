# Connecting alchemist404.com (Namecheap) to Cloud Run

The site is live at https://alchemist404-945483496927.europe-west1.run.app. To serve it at alchemist404.com, three things must happen: Google must verify you own the domain, Namecheap DNS must point at Google's servers, and Claude Code must create the Cloud Run domain mappings. Steps 1 and 2 are yours; step 4 is Claude Code's.

## Step 1. Get the verification TXT value

Claude Code opened a Google Search Console tab for alchemist404.com (if it is gone, go to https://search.google.com/search-console, make sure you are signed in as aleksloma@gmail.com, add a "Domain" property for alchemist404.com). It shows a value that looks like:

    google-site-verification=AbC123...xyz

Copy that whole value. Keep the Search Console tab open, you will click Verify in step 3.

## Step 2. Add DNS records in Namecheap

1. Log in at namecheap.com, go to Domain List, click Manage next to alchemist404.com.
2. Open the Advanced DNS tab.
3. Delete the parking records Namecheap adds by default (typically a "CNAME www -> parkingpage.namecheap.com" and a "URL Redirect @" record). Leave any email/MX records you may have added on purpose.
4. Add these records (TTL: Automatic is fine):

| Type  | Host | Value |
|-------|------|-------|
| A     | @    | 216.239.32.21 |
| A     | @    | 216.239.34.21 |
| A     | @    | 216.239.36.21 |
| A     | @    | 216.239.38.21 |
| AAAA  | @    | 2001:4860:4802:32::15 |
| AAAA  | @    | 2001:4860:4802:34::15 |
| AAAA  | @    | 2001:4860:4802:36::15 |
| AAAA  | @    | 2001:4860:4802:38::15 |
| CNAME | www  | ghs.googlehosted.com |
| TXT   | @    | google-site-verification=... (the value from step 1) |

Notes: in Namecheap "Host @" means the bare domain alchemist404.com. If Namecheap refuses the trailing dot in ghs.googlehosted.com., enter it without the dot. Save all changes.

## Step 3. Verify in Search Console

Back in the Search Console tab, click Verify. If it fails, wait 10 to 30 minutes (TXT propagation) and click Verify again. Namecheap DNS usually propagates within minutes.

## Step 4. Tell Claude Code to finish

Once verification succeeds, go back to Claude Code and say: "domain verified, create the domain mappings". It will run the mappings for alchemist404.com and www.alchemist404.com in region europe-west1.

## Step 5. Wait for SSL

After the mappings exist and DNS has propagated, Google provisions the HTTPS certificate automatically. This takes from about 15 minutes up to a few hours. When https://alchemist404.com loads with a valid certificate, you are done. Nothing to renew or maintain afterward.

Check status anytime with: `gcloud beta run domain-mappings describe --domain alchemist404.com --region europe-west1` or in the Cloud Run console under Domain mappings.
