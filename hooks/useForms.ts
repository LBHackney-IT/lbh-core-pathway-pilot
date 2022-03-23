import {Form} from "../types";
import getForms from "../config/forms";
import {useEffect, useState} from "react";
import {data} from "browserslist";


const useForms = (formId: string) : Form | null => {
  const [form, setForms] = useState<Form | null>(null)

  const forms = getForms()


  console.log("Hello!")


  useEffect(() => {
    getForms().then(data => setForms(data.find(f => f.id === formId) || null))
  }, )

  return form;
}

export default useForms
