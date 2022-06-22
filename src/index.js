import * as rrweb from 'rrweb'

const eventsMatrix = [[]];
rrweb.record({
    emit(event, isCheckout) {
        console.log(event, isCheckout)
      // isCheckout 是一个标识，告诉你重新制作了快照
      if (isCheckout) {
        eventsMatrix.push([]);
      }
      const lastEvents = eventsMatrix[eventsMatrix.length - 1];
      lastEvents.push(event);
    },
    // checkoutEveryNth: 200, // 每 200 个 event 重新制作快照
    checkoutEveryNms: 20000 // 每20秒重新制作制作一个快照
  });

if (typeof window !== 'undefined' && window) {
    window.rrweb = window.rrweb || rrweb
    window.onerror = function () {
        const len = eventsMatrix.length;
        let events = eventsMatrix
        if (len >= 2) {
            events = eventsMatrix[len - 2].concat(eventsMatrix[len - 1]);
        } else {
            events.push([])
        }
        
        // const body = JSON.stringify({ events });
        localStorage.setItem('RRWEB_EVENT', JSON.stringify(events))
        // fetch('http://YOUR_BACKEND_API', {
        //   method: 'POST',
        //   headers: {
        //     'Content-Type': 'application/json',
        //   },
        //   body,
        // });
      };
}

export default rrweb