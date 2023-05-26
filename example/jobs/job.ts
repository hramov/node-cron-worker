export async function run(params: any) {
    console.log(params);
    await new Promise(r => setTimeout(r, 5000));
}