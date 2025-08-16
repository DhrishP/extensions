# Website Blocker & Redirector

A Chrome extension that blocks distracting websites and redirects users to productive alternatives instead of just blocking access.

## Features

- **Block Distracting Websites**: Add websites to a block list to prevent access
- **Multiple Redirect Sites**: Add multiple productive websites to redirect to
- **Random Redirect Selection**: Each time you visit a blocked site, you're randomly redirected to one of your chosen productive alternatives
- **Customizable Redirect Destinations**: Set your own collection of redirect URLs (defaults to Google)
- **Easy Management**: Simple popup interface to add/remove blocked sites and manage redirect destinations
- **Persistent Storage**: Your settings are saved across browser sessions

## How It Works

1. **Blocking**: When you try to visit a blocked website, the extension intercepts the request
2. **Random Redirecting**: Instead of blocking access completely, you're automatically redirected to a randomly selected productive website from your list
3. **Variety**: Each visit to a blocked site results in a different productive destination, keeping the experience fresh
4. **Productivity**: This approach helps you stay focused by replacing distractions with productive alternatives

## Installation

1. Download or clone this repository
2. Open Chrome and go to `chrome://extensions/`
3. Enable "Developer mode" in the top right
4. Click "Load unpacked" and select the `block-websites` folder
5. The extension icon should appear in your toolbar

## Usage

### Adding Redirect Sites
1. Click the extension icon to open the popup
2. In the "Redirect Sites" section, enter a URL (e.g., `https://www.google.com`)
3. Click "Add" to add it to your redirect list
4. You can add multiple redirect sites for variety

### Managing Redirect Sites
- **View**: All your redirect sites are displayed in a list
- **Remove**: Click "Remove" next to any redirect site to delete it
- **Minimum**: You must have at least one redirect site at all times
- **Random Selection**: Each blocked site visit randomly chooses from your redirect list

### Adding Blocked Websites
1. In the "Blocked Websites" section, enter a domain (e.g., `facebook.com`)
2. Click "Add" to add it to your block list
3. The site will now redirect to a random destination from your redirect list when accessed

### Removing Blocked Websites
1. Find the website in your blocked list
2. Click the "Remove" button next to it

## Example Use Cases

- **Social Media**: Redirect Facebook, Twitter, Instagram to productivity tools (Notion, Trello, Asana)
- **Entertainment**: Redirect YouTube, Netflix to learning platforms (Coursera, Udemy, Khan Academy)
- **Gaming**: Redirect gaming sites to coding tutorials, documentation, or project management tools
- **News**: Redirect news sites to educational resources, skill-building platforms, or productivity apps

## Default Settings

- **Default Redirect**: `https://www.google.com` (always included)
- **Storage**: Uses Chrome's sync storage for cross-device settings
- **Permissions**: Requires access to all URLs and storage for functionality

## Technical Details

- **Manifest Version**: 3 (latest Chrome extension standard)
- **Permissions**: `storage`, `declarativeNetRequest`, `tabs`
- **Host Permissions**: `<all_urls>` for blocking functionality
- **Background Script**: Service worker that handles URL interception and random redirects
- **Random Selection**: Uses JavaScript's Math.random() for unbiased selection

## Privacy

- No data is sent to external servers
- All settings are stored locally in your browser
- The extension only accesses URLs you explicitly block
- Random selection happens locally in your browser

## Troubleshooting

- **Extension not working**: Make sure it's enabled in `chrome://extensions/`
- **Sites not redirecting**: Check that the domain is correctly added (e.g., `facebook.com` not `www.facebook.com`)
- **Redirect not working**: Verify your redirect URLs are valid and accessible
- **No variety in redirects**: Make sure you have multiple redirect sites added

## Contributing

Feel free to submit issues or pull requests to improve the extension!

## License

This project is open source and available under the MIT License.
