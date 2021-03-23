# node-windows-folder-manager
node-folder-manager 

## @examples
```javascript
import { nfm } from 'node-folder-manager'

// create new folder
nfm.create('./temp'); 
// remove folder
nfm.remove('./temp'); 
// glob
nfm.glob('./node_modules');
// copy recursive
nfm.copy('./node_modules', './temp', true);

```