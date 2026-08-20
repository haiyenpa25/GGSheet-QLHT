const fs = require('fs');

const index = fs.readFileSync('QuanLyBanNganh/Index.html', 'utf8');
const styles = fs.readFileSync('QuanLyBanNganh/Styles.html', 'utf8');
const js = fs.readFileSync('QuanLyBanNganh/JavaScript.html', 'utf8');

const combined = index
  .replace("<?!= include('Styles'); ?>", styles)
  .replace("<?!= include('JavaScript'); ?>", js)
  .replace("<?= sheetId ?>", '1GkrK5hZdRArVkB125GEpKdbFgxglZP0IMRae27M9dBQ')
  .replace("<?= banNganhId ?>", 'id_41451e0a')
  .replace("<?= banNganhTitle ?>", 'Ban Thanh Tráng');

fs.writeFileSync('scratch/full_rendered.html', combined, 'utf8');
console.log('full_rendered.html written with length:', combined.length);
