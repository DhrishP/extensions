# YouTube Smart Transcript

A Chrome extension that provides smart transcripts for YouTube videos. It analyzes video content to determine if it's coding-related, and either redirects to YouTube's home page (for coding videos) or displays a transcript with only the important points.

## Features

- Extracts transcripts from YouTube videos
- Analyzes video content to detect coding-related topics
- Redirects to YouTube home page for coding videos
- For non-coding videos, displays a transcript with only the important points
- Filters out unnecessary information from transcripts

## Installation

### Development Mode

1. Clone or download this repository to your local machine
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable "Developer mode" by toggling the switch in the top right corner
4. Click "Load unpacked" and select the directory containing the extension files
5. The extension should now appear in your Chrome toolbar

### From Chrome Web Store (Coming Soon)

1. Visit the Chrome Web Store page for YouTube Smart Transcript (link to be added)
2. Click "Add to Chrome"
3. Confirm the installation when prompted

## How to Use

1. Navigate to any YouTube video
2. Click on the YouTube Smart Transcript extension icon in your Chrome toolbar
3. Click the "Get Transcript" button
4. If the video is detected as coding-related, you'll be redirected to YouTube's home page
5. If the video is not coding-related, you'll see a list of important points from the transcript

## Technical Details

This extension works by:

1. Extracting the transcript from YouTube videos
2. Analyzing the content using keyword detection to determine if it's coding-related
3. For non-coding videos, processing the transcript to identify important points
4. Displaying only the essential information in a clean, easy-to-read format

## Limitations

- The transcript extraction relies on YouTube's built-in transcript feature, which may not be available for all videos
- The coding detection and important point extraction use simple algorithms and may not be perfect
- The extension requires permission to access and modify content on YouTube pages

## Future Improvements

- Improve transcript extraction reliability
- Enhance coding detection accuracy
- Add more sophisticated NLP for better important point extraction
- Add user settings to customize behavior
- Support for more languages

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details. 