import React, { useState, useEffect, useRef } from 'react';

const Dropdown = (props) => {
    let [show, setShow] = useState(false);
    let dropDown = useRef();
    const toggleShow = e => {
        if(e) e.stopPropagation()
        setShow(!show);
    }
    useEffect(() => {
        let listener = e => {
            if(!dropDown.current.contains(e.target)) setShow(false);
        }
        window.addEventListener('click', listener);
        return () => window.removeEventListener('click', listener);
    }, []);
    return <div className={'mnu' + (show ? ' -shw' : '')} ref={dropDown}>
        {props.button(toggleShow)}
        <div className="mnu-drp">
            {React.Children.map(props.children, child => {
                return React.cloneElement(child, {
                    close: toggleShow
                })
            })}
        </div>
    </div>
}

export default Dropdown;