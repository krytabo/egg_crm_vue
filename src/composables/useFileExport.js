// packages/shared/composables/useFileExport.js
import { useMainStore } from '@/stores/LoadingStore';

const downloadMode = 'fetch'; //下載方式：newWindow=另開視窗，fetch=直接下載，direct＝另開視窗直接下載
export const useFileExport = () => {
  const mainStore = useMainStore();

  const downloadFile = async (apiFn, payload = {}, defaultFileName = 'DownloadFile.xlsx') => {
    mainStore.setLoading(true);
    try {
      const response = await apiFn(payload);
      const contentDisposition = response.headers?.['content-disposition'];
      let filename = defaultFileName;

      if (contentDisposition) {
        const utf8Match = contentDisposition.match(/filename\*=utf-8''([^;]+)/);
        const asciiMatch = contentDisposition.match(/filename=([^;]+)/);
        if (utf8Match) {
          filename = decodeURIComponent(utf8Match[1]);
        } else if (asciiMatch) {
          filename = asciiMatch[1].replace(/^['"]|['"]$/g, '');
        }
      }

      //fetch + blob
      if (downloadMode === 'fetch') {
        const blob = new Blob([response.data], {
          type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        });
        const url = globalThis.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', filename);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        globalThis.URL.revokeObjectURL(url);
      }

      //另開視窗直接下載(因瀏覽器關係無法指定檔名，但是會自動關閉新視窗)
      if (downloadMode === 'direct') {
        const blob = new Blob([response.data], {
          type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        });
        const url = globalThis.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        setTimeout(() => globalThis.URL.revokeObjectURL(url), 1000);
      }

      //另開視窗(可以指定檔名，但是瀏覽器關係無法自動關閉新視窗)
      if (downloadMode === 'newWindow') {
        const blob = new Blob([response.data], {
          type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        });
        const url = globalThis.URL.createObjectURL(blob);

        //Safari在沒有noopener,noreferrer的時候有可能會擋彈窗，所以加上
        const newWin = globalThis.open('', '_blank', 'noopener,noreferrer');
        if (newWin) {
          const doc = newWin.document; // 這是修改的地方：避免直接使用 deprecated 的 document.write
          doc.open();
          doc.write(`
      <html>
      <body style="display:flex;align-items:center;justify-content:center;height:100vh;font-family:sans-serif;">
      <!--<p>正在準備下載檔案：<b>${filename}</b> ...</p>-->
      <script>
      const blobUrl = '${url}';
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = '${filename}';
      document.body.appendChild(link);
      link.click();
      setTimeout(() => {
        globalThis.URL.revokeObjectURL(blobUrl);
        globalThis.close();
      }, 5500);
      </script>
      </body>
      </html>
    `);
          doc.close(); // 這是修改的地方：確保文檔安全關閉
        } else {
          //被瀏覽器阻擋 popup 時 fallback 成直接下載
          const link = document.createElement('a');
          link.href = url;
          link.download = filename;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          globalThis.URL.revokeObjectURL(url);
        }
      }
    } catch (error) {
      await mainStore.SWAL_Error(error);
    } finally {
      mainStore.setLoading(false);
    }
  };

  return { downloadFile };
};
