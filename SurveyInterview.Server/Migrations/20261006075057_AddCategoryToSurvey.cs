using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SurveyInterview.Server.Migrations
{
    /// <inheritdoc />
    public partial class AddCategoryToSurvey : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "Category",
                table: "Surveys",
                type: "nvarchar(max)",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Category",
                table: "Surveys");
        }
    }
}
