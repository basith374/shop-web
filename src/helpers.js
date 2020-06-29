export const onChange = (setter) => {
    return ({ target: { value } }) => setter(value)
}