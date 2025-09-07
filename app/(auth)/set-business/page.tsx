"use client";
import React from "react";
import AddBusinessForm from "@/components/auth/forms/add-business.form";

const Page = () => {
  return (
    <>
      <p className={"text-sm uppercase text-primary-green"}>Step 2/3</p>
      <h1 className={"text-2xl md:text-4xl font-bold leading-normal"}>
        Tell us about your business
      </h1>
      <p className={"mb-4 md:mb-5 text-lg md:text-2xl font-normal"}>
        Help us <span className={"font-medium text-pink-500"}>understand</span>{" "}
        your business better
      </p>
      <AddBusinessForm />
    </>
  );
};

export default Page;
