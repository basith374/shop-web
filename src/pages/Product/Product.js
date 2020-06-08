import React, { useRef, useEffect, useState } from 'react';
import { useParams, useHistory } from 'react-router-dom';
import { useQuery, useMutation } from '@apollo/react-hooks';
import { gql } from 'apollo-boost';
import _ from 'lodash';
import { useDropzone } from 'react-dropzone';

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
            productVariants {
                id
                name
                price
                purchasePrice
                mrp
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
    mutation CreateProduct($name: String!, $description: String, $tags: String, $categoryId: Int!, $active: Boolean!, $productVariants: [ProductVariantInput!]!) {
        addProduct(name: $name, description: $description, tags: $tags, categoryId: $categoryId, active: $active, ProductVariants: $productVariants) {
            id
        }
    }
`

const UPDATE_PRODUCT = gql`
    mutation UpdateProduct($id: Int!, $name: String!, $description: String, $tags: String, $categoryId: Int!, $active: Boolean!, $productVariants: [ProductVariantInput!]!) {
        updateProduct(id: $id, name: $name, description: $description, tags: $tags, categoryId: $categoryId, active: $active, ProductVariants: $productVariants)
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
    let { id } = useParams();
    if(id) id = parseInt(id, 10);
    // dropzone
    // let [uploadImage] = useMutation(UPLOAD_IMAGE)
    const [files, setFiles] = useState([]);
    const { getRootProps, getInputProps } = useDropzone({
        accept: 'image/*',
        onDrop: acceptedFiles => {
            let newFiles = acceptedFiles.map(f => Object.assign(f, {
                preview: URL.createObjectURL(f)
            }))
            setFiles(files.concat(newFiles))
            acceptedFiles.forEach(f => {
                // uploadImage({
                //     variables: { image: f },
                //     update(cache, { data: { uploadImage }}) {
                //         f.uploadedImageId = uploadImage.id;
                //     }
                // })
            });
        }
    })
    useEffect(() => () => {
      // Make sure to revoke the data uris to avoid memory leaks
      files.forEach(f => URL.revokeObjectURL(f.preview));
    }, [files]);
    const { data } = useQuery(GET_CATEGORIES);
    const { data: data2 } = useQuery(GET_PRODUCT, {
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
            setVariants(data2.product.productVariants)
        }
    }, [data2]);
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
            categoryId: parseInt(catg.current.value, 10),
            active: actv.current.checked,
            productVariants: variants.map(v => {
                if(isNaN(v.id)) v = _.omit(v, 'id');
                return _.omit(v, '__typename')
            }),
        }
        if(_.get(data2, 'product')) updateProduct({
            variables: Object.assign({ id }, variables),
            update(cache) {
                const { product } = cache.readQuery({ query: GET_PRODUCT, variables: { id } })
                cache.writeQuery({
                    query: GET_PRODUCT,
                    data: { product: Object.assign({}, product, variables) },
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
                        {data && data.categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                </div>
            </div>
        </div>
        <div className={'img-drp ptr' + (files.length === 0 ? ' emp' : '')}>
            <div {...getRootProps({className: 'drp'})}>
                <div>Select images / Drop images here</div>
            </div>
            <div className="prw">
                {files.map((f, i) => {
                    let removeFile = () => {
                        setFiles([...files.slice(0, i), ...files.slice(i + 1)])
                    }
                    return <div className="prw-i" key={i}>
                        <button onClick={removeFile}><img src="/close.svg" /></button>
                        <img src={f.preview} alt="preview" />
                    </div>
                })}
            </div>
        </div>
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