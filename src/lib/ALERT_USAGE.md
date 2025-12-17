# Alert Library Usage Guide

This library provides a modern replacement for `window.alert()` and `window.confirm()` using React components.

## Installation

The library is already set up at `@/lib/alert`. Just import it in your components.

## Basic Usage

### Import

```javascript
import { alert, confirm, alertSuccess, alertError, alertWarning, alertInfo } from '@/lib/alert';
// Or import the default export
import Alert from '@/lib/alert';
```

### Alert (replacement for window.alert)

```javascript
// Simple alert
await alert('This is an alert message');

// Alert with type
await alert('Operation successful!', 'success');
await alert('An error occurred!', 'error');
await alert('Please be careful', 'warning');
await alert('Information message', 'info');

// Alert with custom title
await alert('Profile updated successfully', 'success', 'Success');

// Using convenience methods
await alertSuccess('Profile updated successfully');
await alertError('Failed to save changes');
await alertWarning('This action cannot be undone');
await alertInfo('New features available');
```

### Confirm (replacement for window.confirm)

```javascript
// Simple confirm
const result = await confirm('Are you sure you want to delete this item?');
if (result) {
  // User clicked confirm
  console.log('User confirmed');
} else {
  // User clicked cancel
  console.log('User cancelled');
}

// Confirm with custom title
const result = await confirm(
  'This will permanently delete the item.',
  'Delete Item'
);

// Confirm with options
const result = await confirm('Delete this item?', 'Confirm Delete', {
  type: 'danger', // 'warning' or 'danger'
  confirmText: 'Delete',
  cancelText: 'Cancel',
  onConfirm: async () => {
    // This runs before resolving
    await deleteItem();
  }
});
```

## Migration Examples

### Before (using window.alert)
```javascript
alert('Item saved successfully');
```

### After (using alert library)
```javascript
import { alertSuccess } from '@/lib/alert';

alertSuccess('Item saved successfully');
```

### Before (using window.confirm)
```javascript
if (confirm('Are you sure?')) {
  deleteItem();
}
```

### After (using alert library)
```javascript
import { confirm } from '@/lib/alert';

const result = await confirm('Are you sure?');
if (result) {
  deleteItem();
}
```

## Alert Types

- `ALERT_TYPES.SUCCESS` - Green alert with checkmark
- `ALERT_TYPES.ERROR` - Red alert with X icon
- `ALERT_TYPES.WARNING` - Yellow alert with warning icon
- `ALERT_TYPES.INFO` - Blue alert with info icon

## Features

- ✅ Modern React-based dialogs
- ✅ Supports Arabic and English
- ✅ Customizable titles and messages
- ✅ Promise-based API (async/await)
- ✅ Type-safe with different alert types
- ✅ Beautiful UI with icons
- ✅ Accessible and responsive






















