import fetch from 'node-fetch';

const getToken = async () => {
  const url = 'https://clerk.runpod.io/v1/client/sessions/sess_2gcO0DWXhXvDJRPJg3EIvxaETKD/tokens?_clerk_js_version=4.72.4';
  const options = {
    method: 'POST',
    headers: {
      'accept': '*/*',
      'accept-language': 'en-US,en;q=0.9',
      'content-length': '0',
      'content-type': 'application/x-www-form-urlencoded',
      'cookie': '_cfuvid=UyNcpcqgbb47D1pR2Mq7tOt6V5H9n.z.Jl_6GhzjVE0-1715993163253-0.0.1.1-604800000; __client=eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImNsaWVudF8yZ2NOelQzQVpLN3BRb3R2bHFZaGl4dmpBdVUiLCJyb3RhdGluZ190b2tlbiI6ImJjN3dnd21pamY4eDUwcHRpNG13YTFueWV0M21nNTExenc4ODA2anAifQ.Dxp3uH-OhxrkvyuFNcuyf-4mLD-PE8--vZLUln-aJtGaIHljK10FGPuiTTRs48ms8gyBia_6vthVDEG-29_edKVHyxgttVhwYAogj7Cqr3Y0lQeSt5vdHxPhl6ZsDRt4DkzjssfRSAuKuhKkekcKbc7YugUehGv_0ZD5rw6FEMqMto4psL6-O3AFvQRMecI0zumQEV7CUhJPWyetO4fGJVIgFe6aYW_JLDgyJ3Hey-Bl5U5eYlWEli_PwnGPBXNPY1LeHCT_Ov2b9fwrOyWEzTE-2QiUrQVQHD6P_kxfGW4o1Fm2bBWgyVcKcKhA-RyEeJ-YAmzv-mDzyG-xIMUmlQ; __client_uat=1715993173; _gcl_au=1.1.759343434.1716013098; _ga=GA1.1.1939819015.1716013098; _clck=1qcazeg%7C2%7Cflv%7C0%7C1599; hubspotutk=abff287a12a74a6f86217ce66886a6fe; __hssrc=1; _fbp=fb.1.1716013099160.641281417; __hstc=81913865.abff287a12a74a6f86217ce66886a6fe.1716013098720.1716013098720.1716021027563.2; _uetsid=6b1a6c9014de11efa151879024376578; _uetvid=6b1a8c2014de11efacf559177e075db0; _rdt_uuid=1716013098401.f4b27e61-4278-4045-bf2d-f5683e37ca0c; _ga_KMF5V28LQG=GS1.1.1716021027.2.1.1716022089.60.0.1330584765; __hssc=81913865.3.1716021027563; _clsk=qdeu50%7C1716022090122%7C11%7C1%7Cu.clarity.ms%2Fcollect; __cf_bm=My4OpXK6eP5OA1Puw4EdTZ4zh3QB5m1.TDFVryMbry8-1716022232-1.0.1.1-cmRdyp4cJWHFLge7F.OAQQSxo5szGtVGbcXrOlP6iFF1krKFCwm1YzMseRzXfaDrpxkC711Vp5h3lU._ncIYZg',
      'origin': 'https://www.runpod.io',
      'priority': 'u=1, i',
      'referer': 'https://www.runpod.io/',
      'sec-ch-ua': '"Chromium";v="124", "Google Chrome";v="124", "Not-A.Brand";v="99"',
      'sec-ch-ua-mobile': '?0',
      'sec-ch-ua-platform': '"macOS"',
      'sec-fetch-dest': 'empty',
      'sec-fetch-mode': 'cors',
      'sec-fetch-site': 'same-site',
      'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36'
    }
  };

  try {
    const response = await fetch(url, options);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data: { object: string; jwt: string } = await response.json();
    if (data.object === 'token' && data.jwt) {
      return data.jwt;
    } else {
      throw new Error('Invalid token response');
    }
  } catch (error) {
    console.error('Error fetching token:', error);
    throw new Error('Failed to fetch token');
  }
};

export { getToken };
