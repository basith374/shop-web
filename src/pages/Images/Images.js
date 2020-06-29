import React, { useState } from 'react';
import { useQuery, useMutation } from '@apollo/react-hooks';
import { gql } from 'apollo-boost';
import { PropTypes } from 'prop-types';
import Loading from '../Loading';
import { onChange } from '../../helpers';

const UPLOAD_IMAGE = gql`
    mutation UploadImage($image: Upload!) {
        uploadImage(image: $image) {
            id
            filename
        }
    }
`

const GET_IMAGES = gql`
    query($str: String) {
        images(str: $str) {
            id
            filename
        }
    }
`

const DELETE_IMAGE = gql`
    mutation DeleteImage($id: Int!) {
        deleteImage(id: $id)
    }
`

export const Dropzone = (props) => {
    let [uploadImage] = useMutation(UPLOAD_IMAGE)
    const [dragOver, setDragOver] = useState(false);
    const onDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragOver(false);
        Array.from(e.dataTransfer.files).forEach(f => {
            uploadImage({
                variables: { image: f },
                update(cache, { data: { uploadImage } }) {
                    const { images } = cache.readQuery({ query: GET_IMAGES })
                    cache.writeQuery({
                        query: GET_IMAGES,
                        data: { images: images.concat([uploadImage]) }
                    })
                    if(props.onImageAdded) props.onImageAdded(uploadImage);
                }
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
    let cls = ['drp'];
    if(dragOver) cls.push('ovr')
    // open media lib
    if(props.onClick) cls.push('ptr');
    return <div className={'img-drp'}>
        <div className={cls.join(' ')} onDrop={onDrop} onDragOver={onDragOver} onDragEnter={onDragOver} onDragLeave={onDragLeave} onClick={props.onClick}>
            <div>{props.text || 'Drop images here'}</div>
        </div>
    </div>
}

Dropzone.propTypes = {
    onImageAdded: PropTypes.func,
    onClick: PropTypes.func,
    text: PropTypes.string,
}

const ImagePreview = (props) => {
    let [deleteImage] = useMutation(DELETE_IMAGE)
    const removeImage = () => {
        const cb = () => deleteImage(DELETE_IMAGE, {
            variables: { id: props.id },
            update(cache) {
                const { images } = cache.readQuery({ query: GET_IMAGES })
                cache.writeQuery({
                    query: GET_IMAGES,
                    data: { images: images.filter(i => i !== props.id) }
                })
            }
        })
        window.confirmAction('Are you sure you want to delete this image?', cb);
    }
    const onClick = () => {
        if(props.onSelect) props.onSelect(props.img);
    }
    return <div className={'prw-i' + (props.onSelect ? ' ptr' : '')} onClick={onClick}>
        {!props.onSelect && <button onClick={removeImage}><img src="/close.svg" alt="remove" /></button>}
        <img src={props.img.filename} alt="preview" />
    </div>
}

export const ImageLibrary = (props) => {
    const [search, setSearch] = useState('');
    const {loading, data} = useQuery(GET_IMAGES, {
        variables: { str: search }
    });
    if(loading && !search) return <Loading />
    return <div className="img-lib">
        <div className="il-c">
            <Dropzone text="Drop images here" />
            <div className="c-f">
                <input type="text" placeholder="Search images" value={search} onChange={onChange(setSearch)} />
            </div>
            <div className={'img-drp'}>
                <div className="prw">
                    {data.images.map(i => {
                        return <ImagePreview img={i} onSelect={props.onSelect} key={i.id} />
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