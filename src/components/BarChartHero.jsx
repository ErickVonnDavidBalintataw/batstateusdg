import { BarChart, Card } from "@tremor/react";
import React from "react";

const BarChartHero = ({ data, indexTitle, categoryTitle, width }) => {
    return (
        <Card className={`${width}`}>
            <h3
                className={`font-semibold text-tremor-content-strong dark:text-dark-tremor-content-strong`}
            ></h3>
            <BarChart
                className="h-80"
                data={data}
                index={indexTitle}
                categories={[categoryTitle]}
            />
        </Card>
    );
};

export default BarChartHero;
