import React, { useState } from 'react';
import { useQuery, useMutation } from '@apollo/react-hooks';
import { gql } from 'apollo-boost';

const UPLOAD_IMAGE = gql`
    mutation UploadImage($image: Upload!) {
        uploadImage(image: $image) {
            id
        }
    }
`

const GET_IMAGES = gql`
    query {
        images {
            id
            filename
        }
    }
`

export const ImageLibrary = () => {
    const {loading, error, data} = useQuery(GET_IMAGES);
    const [images, setImages] = useState([]);
    let [uploadImage] = useMutation(UPLOAD_IMAGE)
    const [dragOver, setDragOver] = useState(false);
    const onDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragOver(false);
        let droppedFiles = Array.from(e.dataTransfer.files).map(f => Object.assign({
            preview: URL.createObjectURL(f)
        }, f));
        setImages(images.concat(droppedFiles));
        Array.from(e.dataTransfer.files).forEach(f => {
            console.log(f)
            uploadImage({
                variables: { image: f },
            })
        });
    }
    const onDragOver = (e) => {
        e.preventDefault()
        setDragOver(true);
    }
    const onDragLeave = (e) => {
        setDragOver(false);
    }
    return <div className="img-lib">
        <div className="il-c">
            <div className={'img-drp' + (images.length === 0 ? ' emp' : '')}>
                <div className={'drp' + (dragOver ? ' ovr' : '')} onDrop={onDrop} onDragOver={onDragOver} onDragEnter={onDragOver} onDragLeave={onDragLeave}>
                    <div>Drop images here</div>
                </div>
                <div className="prw">
                    {data && data.images.map(f => {
                        let removeImage = () => {
                            // setImages([...images.slice(0, i), ...images.slice(i + 1)])
                        }
                        return <div className="prw-i" key={f.id}>
                            <button onClick={removeImage}><img src="/close.svg" /></button>
                            <img src={f.filename} alt="preview" />
                        </div>
                    })}
                    {images.map((f, i) => {
                        let removeImage = () => {
                            setImages([...images.slice(0, i), ...images.slice(i + 1)])
                        }
                        return <div className="prw-i" key={i}>
                            <button onClick={removeImage}><img src="/close.svg" /></button>
                            <img src={f.preview} alt="preview" />
                        </div>
                    })}
                </div>
            </div>
        </div>
    </div>
}

const Images = () => {
    return <div>
        <ImageLibrary />
    </div>
}

export default Images;