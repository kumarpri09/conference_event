import { Admin, Resource, List, Datagrid, Edit, TextInput, confirmAlert } from "react-admin";
import jsonServerProvider from "ra-data-json-server";


const dataProvider = jsonServerProvider("https://jsonplaceholder.typicode.com");

export default function AdminController() {
  return (
    <Admin dataProvider={dataProvider}>
      <Resource name="posts" list={List} edit={Edit}>
        <Datagrid>
          <TextInput source="title" />
          <TextInput source="body" />
        </Datagrid>
      </Resource>
    </Admin>
  );
}