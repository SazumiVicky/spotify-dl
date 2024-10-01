/*
  Spotify Downloader
  Author: SazumiVicky
  Github: https://github.com/sazumivicky/spotify-dl
  Instagram: https://instagram.com/moe.sazumiviki
*/

document.addEventListener('DOMContentLoaded', () => {
    Notiflix.Notify.init({
        position: 'right-top',
        fontSize: '14px',
        cssAnimation: true,
        cssAnimationDuration: 300,
        cssAnimationStyle: 'fade',
    });

    document.getElementById('downloadForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const spotifyUrl = document.getElementById('spotifyUrl').value;
        const resultDiv = document.getElementById('result');
        
        Notiflix.Loading.circle('Processing your request...');
        
        try {
            const response = await fetch(`/dl?url=${encodeURIComponent(spotifyUrl)}`);
            const data = await response.json();
            
            Notiflix.Loading.remove();
            
            if (data.error) {
                Notiflix.Notify.failure(data.error);
                resultDiv.innerHTML = '';
            } else {
                Notiflix.Notify.success('Song information retrieved successfully!');
                resultDiv.innerHTML = `
                    <div class="song-info">
                        <h2>${data.metadata.title}</h2>
                        <p>${data.metadata.artists}</p>
                        <img src="${data.metadata.cover}" alt="Album cover" class="album-cover">
                        <p class="description">"${data.metadata.title}" is a song by ${data.metadata.artists}. ${data.metadata.album ? `It was released as part of the album "${data.metadata.album}".` : ''}</p>
                        <a href="${data.downloadLink}" download="${data.fileName}" class="download-button" onclick="Notiflix.Notify.info('Download started!');">Download MP3</a>
                    </div>
                `;
            }
        } catch (error) {
            Notiflix.Loading.remove();
            Notiflix.Notify.failure('Upps something went wrong');
            resultDiv.innerHTML = '';
        }
    });
});