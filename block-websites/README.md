# Website Blocker & Redirector

A Chrome extension that blocks distracting websites and redirects users to productive alternatives instead of just blocking access.

## Features

- **Block Distracting Websites**: Add websites to a block list to prevent access
- **Smart Redirects**: Instead of showing a block page, users are automatically redirected to a chosen productive website
- **Customizable Redirect Destination**: Set your own redirect URL (defaults to Google)
- **Easy Management**: Simple popup interface to add/remove blocked sites and change redirect destinations
- **Persistent Storage**: Your settings are saved across browser sessions

## How It Works

1. **Blocking**: When you try to visit a blocked website, the extension intercepts the request
2. **Redirecting**: Instead of blocking access completely, you're automatically redirected to your chosen productive website
3. **Productivity**: This approach helps you stay focused by replacing distractions with productive alternatives

## Installation

1. Download or clone this repository
2. Open Chrome and go to `chrome://extensions/`
3. Enable "Developer mode" in the top right
4. Click "Load unpacked" and select the `block-websites` folder
5. The extension icon should appear in your toolbar

## Usage

### Setting a Redirect Site
1. Click the extension icon to open the popup
2. In the "Redirect Site" section, enter a URL (e.g., `https://www.google.com`)
3. Click "Set" to save your redirect destination

### Adding Blocked Websites
1. In the "Blocked Websites" section, enter a domain (e.g., `facebook.com`)
2. Click "Add" to add it to your block list
3. The site will now redirect to your chosen destination when accessed

### Removing Blocked Websites
1. Find the website in your blocked list
2. Click the "Remove" button next to it

## Example Use Cases

- **Social Media**: Redirect Facebook, Twitter, Instagram to productivity tools
- **Entertainment**: Redirect YouTube, Netflix to learning platforms
- **Gaming**: Redirect gaming sites to coding tutorials or documentation
- **News**: Redirect news sites to educational resources

## Default Settings

- **Default Redirect**: `https://www.google.com`
- **Storage**: Uses Chrome's sync storage for cross-device settings
- **Permissions**: Requires access to all URLs and storage for functionality

## Technical Details

- **Manifest Version**: 3 (latest Chrome extension standard)
- **Permissions**: `storage`, `declarativeNetRequest`, `tabs`
- **Host Permissions**: `<all_urls>` for blocking functionality
- **Background Script**: Service worker that handles URL interception and redirects

## Privacy

- No data is sent to external servers
- All settings are stored locally in your browser
- The extension only accesses URLs you explicitly block

## Troubleshooting

- **Extension not working**: Make sure it's enabled in `chrome://extensions/`
- **Sites not redirecting**: Check that the domain is correctly added (e.g., `facebook.com` not `www.facebook.com`)
- **Redirect not working**: Verify the redirect URL is valid and accessible

## Contributing

Feel free to submit issues or pull requests to improve the extension!

## License

This project is open source and available under the MIT License.
