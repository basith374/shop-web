import React, { useRef, useEffect, useState } from 'react';
import { useParams, useHistory } from 'react-router-dom';
import { useQuery, useMutation } from '@apollo/react-hooks';
import { gql } from 'apollo-boost';
import _ from 'lodash';
import Loading from '../Loading';
import EmptyPage from '../EmptyPage';
import { ImageLibrary, Dropzone } from '../Images/Images';

const GET_CATEGORIES = gql`
    query {
        categories {
            id
            name
        }
    }
`

const GET_PRODUCT = gql`
    query Product($id: Int!) {
        product(id: $id) {
            id
            name
            description
            tags
            category {
                id
            }
            variants {
                id
                name
                price
                purchasePrice
                mrp
            }
            images {
                id
                filename
            }
        }
    }
`

const GET_PRODUCTS = gql`
    query products {
        products {
            id
        }
    }
`

const ADD_PRODUCT = gql`
    mutation CreateProduct($name: String!, $description: String, $tags: String, $CategoryId: Int!, $active: Boolean!, $variants: [ProductVariantInput!]!, $images: [Int!]!) {
        addProduct(name: $name, description: $description, tags: $tags, CategoryId: $CategoryId, active: $active, ProductVariants: $variants, images: $images) {
            id
        }
    }
`

const UPDATE_PRODUCT = gql`
    mutation UpdateProduct($id: Int!, $name: String!, $description: String, $tags: String, $CategoryId: Int!, $active: Boolean!, $variants: [ProductVariantInput!]!, $images: [Int!]!) {
        updateProduct(id: $id, name: $name, description: $description, tags: $tags, CategoryId: $CategoryId, active: $active, ProductVariants: $variants, images: $images)
    }
`

const DELETE_PRODUCT = gql`
    mutation DeleteProduct($id: Int!) {
        deleteProduct(id: $id)
    }
`

const ProductVariant = (props) => {
    const propsFiller = (key, trans) => {
        return {
            onChange: e => props.variant[key] = trans ? trans(e.target.value) : e.target.value,
            defaultValue: props.variant[key],
        }
    }
    const onRemove = () => {
        props.remove(props.variant.id);
    }
    return <tr>
        <td><input type="text" placeholder="Name" {...propsFiller('name')} /></td>
        <td><input type="number" step="0.01" placeholder="Price" {...propsFiller('price', v => parseFloat(v))} /></td>
        <td><input type="number" step="0.01" placeholder="Purchase price" {...propsFiller('purchasePrice', v => parseFloat(v))} /></td>
        <td><input type="number" step="0.01" placeholder="MRP" {...propsFiller('mrp', v => parseFloat(v))} /></td>
        <td><button onClick={onRemove}>Remove</button></td>
    </tr>
}

// const UPLOAD_IMAGE = gql`
//     mutation UploadImage($image: String)
// `

const Product = () => {
    let history = useHistory();
    let [variants, setVariants] = useState([]);
    let [showImageLibrary, setShowImageLibrary] = useState(false);
    let { id } = useParams();
    if(id) id = parseInt(id, 10);
    // dropzone
    const [images, setImages] = useState([]);
    const { data, loading: loadingCats } = useQuery(GET_CATEGORIES);
    const { data: data2, loading } = useQuery(GET_PRODUCT, {
        skip: !id,
        variables: { id }
    });
    const [addProduct] = useMutation(ADD_PRODUCT, {
        update(cache, { data: { addProduct }}) {
            const { products } = cache.readQuery({ query: GET_PRODUCTS })
            cache.writeQuery({
                query: GET_PRODUCTS,
                data: { products: products.concat([addProduct]) }
            })
            history.goBack()
        }
    });
    const [updateProduct] = useMutation(UPDATE_PRODUCT);
    const [removeProduct] = useMutation(DELETE_PRODUCT);
    useEffect(() => {
        if(data2 && data2.product) {
            name.current.value = data2.product.name;
            desc.current.value = data2.product.description;
            tags.current.value = data2.product.tags;
            catg.current.value = data2.product.category.id;
            actv.current.checked = data2.product.active;
            setVariants(data2.product.variants)
            setImages(data2.product.images)
        }
    }, [data2]);
    useEffect(() => {
        const listener = e => {
            if(e.keyCode === 27) setShowImageLibrary();
        }
        window.addEventListener('keydown', listener);
        return () => {
            window.removeEventListener('keydown', listener);
        }
    }, [showImageLibrary, setShowImageLibrary]);
    // fields
    const name = useRef();
    const desc = useRef();
    const tags = useRef();
    const catg = useRef();
    const actv = useRef();
    // methods
    const createProduct = () => {
        const variables = {
            name: name.current.value,
            description: desc.current.value,
            tags: tags.current.value,
            CategoryId: parseInt(catg.current.value, 10),
            active: actv.current.checked,
            productVariants: variants.map(v => {
                if(isNaN(v.id)) v = _.omit(v, 'id');
                return _.omit(v, '__typename')
            }),
            images: images.map(i => i.id),
        }
        if(_.get(data2, 'product')) updateProduct({
            variables: {...variables, id },
            update(cache) {
                const { product } = cache.readQuery({ query: GET_PRODUCT, variables: { id } })
                cache.writeQuery({
                    query: GET_PRODUCT,
                    data: { product: {...product, ...variables} },
                })
                history.goBack();
            }
        })
        else addProduct({ variables });
    }
    const delProduct = () => {
        removeProduct({
            variables: { id },
            update(cache) {
                const { products } = cache.readQuery({ query: GET_PRODUCTS })
                cache.writeQuery({
                    query: GET_PRODUCTS,
                    data: { products: products.filter(p => p.id !== id) }
                })
                history.goBack()
            }
        })
    }
    const addVariant = () => {
        setVariants(variants.concat({ id: 't_' + new Date().valueOf() }));
    }
    const removeVariant = (id) => {
        setVariants(variants.filter(v => v.id !== id));
    }
    if(id && loading) return <div>
        <Loading />
    </div>
    if(id && !data2.product) return <div>
        <EmptyPage msg="Product not found" />
    </div>
    return <div>
        <div className="p-h">
            <h1>{_.get(data2, 'product') ? 'Edit' : 'Create'} Product</h1>
        </div>
        <div className="c-f -h">
            <div className="grp">
                <label>Name *</label>
                <div>
                    <input type="text" ref={name} />
                </div>
            </div>
            <div className="grp">
                <label>Description</label>
                <div>
                    <textarea ref={desc}></textarea>
                </div>
            </div>
            <div className="grp">
                <label>Tags</label>
                <div>
                    <input type="text" ref={tags} />
                </div>
            </div>
            <div className="grp">
                <label>Category *</label>
                <div>
                    <select ref={catg}>
                        {!loadingCats && data.categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                </div>
            </div>
        </div>
        <Dropzone
            text="Select images / Drop images here"
            onClick={() => setShowImageLibrary(true)}
            onImageAdded={img => setImages([img, ...images])} />
        <div className={'img-drp'}>
            <div className="prw">
                {images.map(img => {
                    let removeImg = () => setImages(images.filter(i => i.id !== img.id))
                    return <div className="prw-i" key={img.id}>
                        <button onClick={removeImg}><img src="/close.svg" alt="remove" /></button>
                        <img src={img.filename} alt="preview" />
                    </div>
                })}
            </div>
        </div>
        {showImageLibrary && <div className="mdl" onClick={() => setShowImageLibrary(false)}>
            <div className="mdl-l" onClick={e => e.stopPropagation()}>
                <ImageLibrary onSelect={img => {
                    const existing = images.map(i => i.id);
                    if(!existing.includes(img.id)) setImages([img, ...images])
                    setShowImageLibrary(false)
                }} />
            </div>
        </div>}
        <div className="c-f -c">
            <h2>Variants</h2>
            <table className="pt">
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Price</th>
                        <th>Purchase price</th>
                        <th>MRP</th>
                    </tr>
                </thead>
                <tbody>
                    {variants.map(v => <ProductVariant key={v.id} variant={v} remove={removeVariant} />)}
                    <tr>
                        <td><button onClick={addVariant}>Add</button></td>
                    </tr>
                </tbody>
            </table>
        </div>
        <div className="c-f">
            <div className="grp">
                <label className="spc"><input type="checkbox" ref={actv} defaultChecked /> Active</label>
            </div>
            <div className={_.get(data2, 'product') ? 'grp' : ''}>
                <button onClick={createProduct}>{_.get(data2, 'product') ? 'Update' : 'Create'}</button>
            </div>
        </div>
        
        {_.get(data2, 'product') && <div className="sep">
            <div className="-c">
                <div className="p-h">
                    <h1>Danger zone</h1>
                </div>
                <div className="c-f">
                    <button onClick={delProduct} className="red">Delete</button>
                </div>
            </div>
        </div>}
    </div>
}

export default Product;