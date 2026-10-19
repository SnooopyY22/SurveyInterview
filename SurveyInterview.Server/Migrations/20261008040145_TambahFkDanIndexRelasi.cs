using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SurveyInterview.Server.Migrations
{
    /// <inheritdoc />
    public partial class TambahFkDanIndexRelasi : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // Bersihkan data orphan sebelum FK dibuat, agar ALTER TABLE tidak gagal.
            migrationBuilder.Sql("""
                DELETE FROM SurveyResponses
                WHERE SurveyId NOT IN (SELECT Id FROM Surveys);
                """);

            // FK SurveyResponses -> Surveys (Restrict: survey berisi responden tidak bisa dihapus)
            migrationBuilder.CreateIndex(
                name: "IX_SurveyResponses_SurveyId",
                table: "SurveyResponses",
                column: "SurveyId");

            migrationBuilder.AddForeignKey(
                name: "FK_SurveyResponses_Surveys_SurveyId",
                table: "SurveyResponses",
                column: "SurveyId",
                principalTable: "Surveys",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            // FK Answers -> Questions (Cascade: jawaban ikut terhapus bersama pertanyaannya)
            migrationBuilder.CreateIndex(
                name: "IX_Answers_QuestionId",
                table: "Answers",
                column: "QuestionId");

            migrationBuilder.AddForeignKey(
                name: "FK_Answers_Questions_QuestionId",
                table: "Answers",
                column: "QuestionId",
                principalTable: "Questions",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Answers_Questions_QuestionId",
                table: "Answers");

            migrationBuilder.DropIndex(
                name: "IX_Answers_QuestionId",
                table: "Answers");

            migrationBuilder.DropForeignKey(
                name: "FK_SurveyResponses_Surveys_SurveyId",
                table: "SurveyResponses");

            migrationBuilder.DropIndex(
                name: "IX_SurveyResponses_SurveyId",
                table: "SurveyResponses");
        }
    }
}
