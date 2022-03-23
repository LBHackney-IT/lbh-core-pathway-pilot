import {Form} from "../types";
import getForms from "../config/forms";
import {useEffect, useState} from "react";
import {data} from "browserslist";


const useForms = (formId: string) : Form | null => {
  const [form, setForms] = useState<Form | null>(null)
  useEffect(() => {
    getForms().then(data => setForms(data.find(f => f.id === formId) || null))
  }, [formId])

  return form;
}

export default useForms
