# CIDR Information Viewer Extension for Firefox

This Firefox extension provides users with a simple interface to view detailed information about an IP address in CIDR notation. The extension converts the provided CIDR block into both its **binary format** and detailed **IP range information**, helping users better understand the scope of IP addresses within a given CIDR block.

You can find the extension on [AMO (Addon Mozilla)](https://addons.mozilla.org/en-US/firefox/addon/cidr-utils/).

## Features

- **CIDR Notation Support**: Input a CIDR block and get detailed information about the corresponding IP address range.
- **Binary Format**: Displays the binary format of the given IP address and subnet mask.
- **User-Friendly Interface**: Easy-to-use popup that provides information instantly upon entering a CIDR block.
  
## How It Works

- The extension allows users to enter an IP address in CIDR notation (e.g., `192.168.1.0/24`).
- It will then display the corresponding IP range, network address, and broadcast address.
- Additionally, the extension shows the IP address and subnet mask in **binary format**, providing a deeper understanding of how IPs are organized.

## Installation

1. Download or clone the repository.
2. Go to **about:debugging** in your Firefox browser.
3. Click on **This Firefox** and then **Load Temporary Add-on**.
4. Select the `manifest.json` file from the downloaded extension folder.

## Usage

1. Click the extension icon in the toolbar.
2. Enter a CIDR block (e.g., `192.168.1.0/24`) into the input field.
3. The extension will display:
   - The **IP address range**.
   - The **Network address** and **Broadcast address**.
   - The **Binary format** of the IP address and subnet mask.
  
## Screenshots

### Extension Popup
![Extension popup](/screenshots/popup.png)

### Extension Preferences
![Extension preferences](/screenshots/preferences.png)
