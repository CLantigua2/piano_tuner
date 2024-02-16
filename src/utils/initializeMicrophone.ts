export function initializeMicrophone(callback: Function) {
  navigator.mediaDevices.getUserMedia({ audio: true })
    .then(function(stream) {
      callback(stream);
    })
    .catch(function(err) {
      console.error('Error accessing microphone:', err);
    });
}
