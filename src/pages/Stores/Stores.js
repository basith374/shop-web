import React from 'react';

export default () => {
    let stores = [
        {
            id: 0,
            name: 'Azeez stores',
            location: 'Thalassery',
        },
        {
            id: 1,
            name: 'Fathima stores',
            location: 'Dharmada',
        },
        {
            id: 2,
            name: 'Family mart',
            location: 'Koduvalli',
        },
    ]
    return <div>
        <h1  className="p-h">Stores</h1>
        <div>
            <table>
                <tbody>
                    {stores.map(s => {
                        return <tr key={s.id}>
                            <td>{s.name}</td>
                        </tr>
                    })}
                </tbody>
            </table>
        </div>
    </div>
}