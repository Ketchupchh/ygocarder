export const uploadToImgur = async (imgLink: string) => {
    const myHeaders = new Headers();
    myHeaders.append('Authorization', `Client-ID ${process.env.REACT_APP_IMGUR_CLIENT_ID}`);

    const formdata = new FormData();
    formdata.append('image', imgLink);
    formdata.append('type', 'url');
    formdata.append('title', imgLink.replace('https://images.ygoprodeck.com/images/cards_cropped/', '').replace('.jpg', ''));

    return await fetch('https://api.imgur.com/3/image', {
        method: 'POST',
        headers: myHeaders,
        body: formdata,
        redirect: 'follow',
    });
};