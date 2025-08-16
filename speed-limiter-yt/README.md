# YouTube Speed Limiter

A Chrome extension that prevents YouTube videos from playing faster than your chosen maximum speed limit.

## Features

- **Customizable Speed Limit**: Set any maximum playback speed between 0.25x and 1.5x
- **Instant Enforcement**: Changes apply immediately to all current and future videos
- **Preset Buttons**: Quick selection of common speeds (0.5x, 0.75x, 1x, 1.25x, 1.5x)
- **Persistent Settings**: Your speed limit preference is saved and restored
- **Privacy-Focused**: No data collection, no external communication, runs entirely locally

## How It Works

The extension monitors YouTube video elements and automatically reduces playback speed when it exceeds your set limit. It uses multiple enforcement methods to ensure reliable speed limiting:

1. **Event Monitoring**: Listens for speed changes and immediately enforces limits
2. **Property Override**: Overrides the `playbackRate` setter for individual video elements
3. **Periodic Checks**: Regularly verifies all videos are within speed limits
4. **DOM Observation**: Automatically detects and limits new videos as they load

## Installation

1. Download the extension files
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable "Developer mode" in the top right
4. Click "Load unpacked" and select the extension folder
5. The extension icon will appear in your toolbar

## Usage

1. **Set Speed Limit**: Click the extension icon to open the popup
2. **Choose Method**: Use the slider or preset buttons to select your maximum speed
3. **Automatic Enforcement**: The extension will automatically limit any video that tries to exceed your chosen speed

## Privacy & Security

- **No Data Collection**: The extension doesn't collect, store, or transmit any personal information
- **Local Storage Only**: Your speed preference is stored locally in your browser
- **No External Communication**: The extension operates entirely within your browser
- **YouTube Only**: Only activates on YouTube.com pages

## Technical Details

- **Manifest Version**: 3 (latest Chrome extension standard)
- **Permissions**: Minimal - only `storage` for saving preferences
- **Host Permissions**: Limited to YouTube.com only
- **Content Scripts**: Runs at document start for maximum effectiveness
- **Browser Compatibility**: Chrome 88+ (Manifest V3 requirement)

## Troubleshooting

**Extension not working?**
- Ensure you're on YouTube.com
- Try refreshing the page
- Check that the extension is enabled in `chrome://extensions/`

**Speed limit not applying?**
- Some YouTube features may temporarily bypass limits
- The extension will automatically re-apply limits
- Try refreshing the video or page

## Development

This extension is built with vanilla JavaScript and follows Chrome Web Store best practices:

- No eval() or code injection
- Minimal permissions
- Clear privacy policy
- Proper error handling
- Performance optimized

## Support

For issues or questions:
- Check the troubleshooting section above
- Review the privacy policy
- Contact: [your-email@example.com]

## License

[Your chosen license] - See LICENSE file for details

## Version History

- **1.0.0**: Initial release with core speed limiting functionality
  - Customizable speed limits (0.25x - 1.5x)
  - Preset speed buttons
  - Persistent settings
  - Privacy-focused design

---

**Note**: This extension is designed to help users maintain control over video playback speed. It respects YouTube's terms of service and only modifies playback behavior within the browser.
