import React from 'react';

const EmptyPage = (props) => {
    return <div className="emp-pg">
        <div>
            <img src="/shine.svg" alt="new" />
            <div>{props.msg}</div>
        </div>
    </div>
}

export default EmptyPage;