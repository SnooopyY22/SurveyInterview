using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SurveyInterview.Server.Migrations
{
    /// <inheritdoc />
    public partial class AddIsMandatoryToQuestion : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "IsMandatory",
                table: "Questions",
                type: "bit",
                nullable: false,
                defaultValue: false);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "IsMandatory",
                table: "Questions");
        }
    }
}
